import { getSessionUser } from "@/lib/auth/userUtil";
import { prisma } from "@/lib/prisma";
import {
  formSubmissionDataSchema,
  getFormSubmissionUpdateTransactions,
} from "@/lib/serverFunctions/mutations/formSubmission";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { Prisma } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { z } from "zod";

const behavioralMapObservationSchema = z.object({
  quantity: z.number().int().positive(),
  observedAt: z.coerce.date(),
  position: z.tuple([z.number().finite(), z.number().finite()]),
  personCharacteristicIds: z
    .array(z.number().int().positive())
    .min(1)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Uma observação não pode repetir características.",
    ),
});

export const saveBehavioralMapDataSchema = z.object({
  behavioralMapId: z.number().int().positive(),
  formSubmission: formSubmissionDataSchema.optional(),
  observations: z.array(behavioralMapObservationSchema),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  isFinalized: z.boolean(),
});

export type SaveBehavioralMapData = z.infer<typeof saveBehavioralMapDataSchema>;
export type SaveBehavioralMapResponse = NonNullable<
  Awaited<ReturnType<typeof saveBehavioralMap>>["data"]
>;

export type SaveBehavioralMapPersonObservationsParams = {
  tx: Prisma.TransactionClient;
  behavioralMapId: number;
  observations: SaveBehavioralMapData["observations"];
};

export const saveBehavioralMapPersonObservations = async ({
  tx,
  behavioralMapId,
  observations,
}: SaveBehavioralMapPersonObservationsParams) => {
  await tx.$executeRaw`DELETE FROM "behavioral_map_person_observation" WHERE "behavioral_map_id" = ${behavioralMapId}`;
  if (observations.length === 0) return;

  const generatedIds = await tx.$queryRaw<
    { index: number; id: number }[]
  >(Prisma.sql`
    SELECT
      "item"."index"::integer AS "index",
      nextval(pg_get_serial_sequence('behavioral_map_person_observation', 'id'))::integer AS "id"
    FROM generate_series(1, ${observations.length}) AS "item" ("index")
    ORDER BY "item"."index"
  `);

  const observationIdsByIndex = new Map<number, number>();
  generatedIds.forEach(({ index, id }) =>
    observationIdsByIndex.set(index - 1, id),
  );

  const observationValues: Prisma.Sql[] = [];
  const characteristicValues: Prisma.Sql[] = [];

  observations.forEach((observation, index) => {
    const observationId = observationIdsByIndex.get(index);
    if (!observationId)
      throw new Error("Não foi possível gerar o ID da observação.");

    observationValues.push(
      Prisma.sql`(
        ${observationId},
        ${behavioralMapId},
        ${observation.quantity},
        ST_SetSRID(ST_MakePoint(${observation.position[0]}, ${observation.position[1]}), 4326),
        ${observation.observedAt}
      )`,
    );
    observation.personCharacteristicIds.forEach((personCharacteristicId) => {
      characteristicValues.push(
        Prisma.sql`(${observationId}, ${personCharacteristicId})`,
      );
    });
  });

  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "behavioral_map_person_observation"
      ("id", "behavioral_map_id", "quantity", "position", "observed_at")
    VALUES ${Prisma.join(observationValues, ",")}
  `);
  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "behavioral_map_person_observation_characteristic"
      ("behavioral_map_person_observation_id", "person_characteristic_id")
    VALUES ${Prisma.join(characteristicValues, ",")}
  `);
};

export const saveBehavioralMap = async (
  request: APIRequestData<SaveBehavioralMapData>,
) => {
  const data = request.data;
  if (!data) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    const user = await getSessionUser();
    if (!user) {
      return {
        responseInfo: {
          statusCode: 401,
          message: "Erro na autenticação!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const behavioralMap = await prisma.behavioralMap.findUnique({
      where: { id: data.behavioralMapId },
      select: {
        userId: true,
        formSubmissionId: true,
        behavioralMapProtocol: {
          select: {
            behavioralMapProtocolGroups: {
              select: {
                personCharacteristicGroup: { select: { isTagGroup: true } },
                characteristics: { select: { personCharacteristicId: true } },
              },
            },
          },
        },
      },
    });

    if (!behavioralMap) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Mapa comportamental não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (user.id !== behavioralMap.userId) {
      try {
        await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
      } catch {
        return {
          responseInfo: {
            statusCode: 401,
            message: "Sem permissão para editar este mapa comportamental!",
          } as APIResponseInfo,
          data: null,
        };
      }
    }

    if (data.isFinalized && !data.endDate) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Informe a data final para finalizar o mapa!",
        } as APIResponseInfo,
        data: null,
      };
    }
    if (
      Boolean(behavioralMap.formSubmissionId) !== Boolean(data.formSubmission)
    ) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Os dados do formulário não correspondem ao mapa!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const protocolGroups =
      behavioralMap.behavioralMapProtocol.behavioralMapProtocolGroups;
    const allowedCharacteristicIds = new Set(
      protocolGroups.flatMap((group) =>
        group.characteristics.map(
          (characteristic) => characteristic.personCharacteristicId,
        ),
      ),
    );

    for (const observation of data.observations) {
      if (
        observation.personCharacteristicIds.some(
          (id) => !allowedCharacteristicIds.has(id),
        )
      ) {
        return {
          responseInfo: {
            statusCode: 400,
            message: "Uma característica não pertence ao protocolo do mapa!",
          } as APIResponseInfo,
          data: null,
        };
      }

      for (const group of protocolGroups) {
        const selectedCount = observation.personCharacteristicIds.filter((id) =>
          group.characteristics.some(
            (characteristic) => characteristic.personCharacteristicId === id,
          ),
        ).length;
        if (
          !group.personCharacteristicGroup.isTagGroup &&
          selectedCount !== 1
        ) {
          return {
            responseInfo: {
              statusCode: 400,
              message: "A seleção de características da observação é inválida!",
            } as APIResponseInfo,
            data: null,
          };
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const map = await tx.behavioralMap.update({
        where: { id: data.behavioralMapId },
        data: {
          startDate: data.startDate,
          endDate: data.endDate,
          isFinalized: data.isFinalized,
        },
        select: { updatedAt: true, isFinalized: true },
      });

      await saveBehavioralMapPersonObservations({
        tx,
        behavioralMapId: data.behavioralMapId,
        observations: data.observations,
      });

      if (behavioralMap.formSubmissionId && data.formSubmission) {
        const transactions = await getFormSubmissionUpdateTransactions({
          prismaClient: tx,
          formSubmissionId: behavioralMap.formSubmissionId,
          formSubmission: data.formSubmission,
        });
        for (const transaction of transactions) await transaction;
      }

      return map;
    });

    return {
      responseInfo: {
        statusCode: 201,
        message: "Mapa comportamental salvo!",
      } as APIResponseInfo,
      data: {
        updatedAt: updated.updatedAt,
        savedAsFinalized: updated.isFinalized,
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar mapa comportamental!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
