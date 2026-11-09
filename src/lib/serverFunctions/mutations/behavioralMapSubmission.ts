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
  localId: z.string().min(1),
  groupLocalIds: z
    .array(z.string().min(1))
    .refine(
      (groupLocalIds) => new Set(groupLocalIds).size === groupLocalIds.length,
      "Uma observação não pode repetir o mesmo grupo.",
    ),
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

const behavioralMapGroupSchema = z.object({
  localId: z.string().min(1),
  label: z.string().trim().min(1).max(255),
});

const behavioralMapLinkSchema = z.object({
  observationALocalId: z.string().min(1),
  observationBLocalId: z.string().min(1),
  description: z.string().trim().min(1).max(2000),
});

export const saveBehavioralMapDataSchema = z
  .object({
    behavioralMapId: z.number().int().positive(),
    formSubmission: formSubmissionDataSchema.optional(),
    observations: z.array(behavioralMapObservationSchema),
    groups: z.array(behavioralMapGroupSchema),
    links: z.array(behavioralMapLinkSchema),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable(),
    isFinalized: z.boolean(),
  })
  .superRefine((data, context) => {
    const localIds = new Set<string>();
    data.observations.forEach((observation, index) => {
      if (localIds.has(observation.localId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["observations", index, "localId"],
          message: "Identificador local de observação repetido.",
        });
      }
      localIds.add(observation.localId);
    });
    const groupLocalIds = new Set<string>();
    data.groups.forEach((group, index) => {
      if (groupLocalIds.has(group.localId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["groups", index, "localId"],
          message: "Identificador local de grupo repetido.",
        });
      }
      groupLocalIds.add(group.localId);
      if (
        !data.observations.some((observation) =>
          observation.groupLocalIds.includes(group.localId),
        )
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["groups", index],
          message: "Um grupo precisa conter ao menos uma observação.",
        });
      }
    });
    data.observations.forEach((observation, index) => {
      observation.groupLocalIds.forEach((groupLocalId, groupIndex) => {
        if (!groupLocalIds.has(groupLocalId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["observations", index, "groupLocalIds", groupIndex],
            message: "A observação referencia um grupo inexistente.",
          });
        }
      });
    });
    data.links.forEach((link, index) => {
      if (
        !localIds.has(link.observationALocalId) ||
        !localIds.has(link.observationBLocalId)
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["links", index],
          message: "A ligação referencia uma observação inexistente.",
        });
      }
    });
  });

export type SaveBehavioralMapData = z.infer<typeof saveBehavioralMapDataSchema>;
export type SaveBehavioralMapResponse = NonNullable<
  Awaited<ReturnType<typeof saveBehavioralMap>>["data"]
>;

export const saveBehavioralMapGroups = async ({
  tx,
  behavioralMapId,
  groups,
}: {
  tx: Prisma.TransactionClient;
  behavioralMapId: number;
  groups: SaveBehavioralMapData["groups"];
}) => {
  await tx.$executeRaw`DELETE FROM "behavioral_map_group" WHERE "behavioral_map_id" = ${behavioralMapId}`;
  const groupIdsByLocalId = new Map<string, number>();
  if (groups.length === 0) return groupIdsByLocalId;

  const generatedIds = await tx.$queryRaw<
    { index: number; id: number }[]
  >(Prisma.sql`
    SELECT "item"."index"::integer AS "index",
      nextval(pg_get_serial_sequence('behavioral_map_group', 'id'))::integer AS "id"
    FROM generate_series(1, ${groups.length}) AS "item" ("index")
    ORDER BY "item"."index"
  `);
  const groupValues = groups.map((group, index) => {
    const groupId = generatedIds.find(
      ({ index: generatedIndex }) => generatedIndex === index + 1,
    )?.id;
    if (!groupId) throw new Error("Não foi possível gerar o ID do grupo.");
    groupIdsByLocalId.set(group.localId, groupId);
    return Prisma.sql`(${groupId}, ${behavioralMapId}, ${group.label})`;
  });

  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "behavioral_map_group" ("id", "behavioral_map_id", "label")
    VALUES ${Prisma.join(groupValues, ",")}
  `);
  return groupIdsByLocalId;
};

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
  const observationIdsByLocalId = new Map<string, number>();
  if (observations.length === 0) return observationIdsByLocalId;

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
    observationIdsByLocalId.set(observation.localId, observationId);

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
  return observationIdsByLocalId;
};

export const saveBehavioralMapPersonObservationGroups = async ({
  tx,
  observations,
  groupIdsByLocalId,
  observationIdsByLocalId,
}: {
  tx: Prisma.TransactionClient;
  observations: SaveBehavioralMapData["observations"];
  groupIdsByLocalId: Map<string, number>;
  observationIdsByLocalId: Map<string, number>;
}) => {
  const memberships: Prisma.Sql[] = [];
  observations.forEach((observation) => {
    const observationId = observationIdsByLocalId.get(observation.localId);
    if (!observationId) {
      throw new Error("Uma associação referencia uma observação inexistente.");
    }
    observation.groupLocalIds.forEach((groupLocalId) => {
      const groupId = groupIdsByLocalId.get(groupLocalId);
      if (!groupId) {
        throw new Error("Uma associação referencia um grupo inexistente.");
      }
      memberships.push(Prisma.sql`(${groupId}, ${observationId})`);
    });
  });

  if (memberships.length === 0) return;
  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "behavioral_map_person_observation_group"
      ("behavioral_map_group_id", "person_observation_id")
    VALUES ${Prisma.join(memberships, ",")}
  `);
};

export const saveBehavioralMapPersonObservationLinks = async ({
  tx,
  behavioralMapId,
  links,
  observationIdsByLocalId,
}: {
  tx: Prisma.TransactionClient;
  behavioralMapId: number;
  links: SaveBehavioralMapData["links"];
  observationIdsByLocalId: Map<string, number>;
}) => {
  await tx.$executeRaw`DELETE FROM "behavioral_map_person_observation_link" WHERE "behavioral_map_id" = ${behavioralMapId}`;
  if (links.length === 0) return;

  const values = links.map((link) => {
    const observationAId = observationIdsByLocalId.get(
      link.observationALocalId,
    );
    const observationBId = observationIdsByLocalId.get(
      link.observationBLocalId,
    );
    if (!observationAId || !observationBId) {
      throw new Error("Uma ligação referencia uma observação inexistente.");
    }
    return Prisma.sql`(${behavioralMapId}, ${observationAId}, ${observationBId}, ${link.description})`;
  });

  await tx.$executeRaw(Prisma.sql`
    INSERT INTO "behavioral_map_person_observation_link"
      ("behavioral_map_id", "observation_a_id", "observation_b_id", "description")
    VALUES ${Prisma.join(values, ",")}
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

      const groupIdsByLocalId = await saveBehavioralMapGroups({
        tx,
        behavioralMapId: data.behavioralMapId,
        groups: data.groups,
      });
      const observationIdsByLocalId = await saveBehavioralMapPersonObservations(
        {
          tx,
          behavioralMapId: data.behavioralMapId,
          observations: data.observations,
        },
      );
      await saveBehavioralMapPersonObservationGroups({
        tx,
        observations: data.observations,
        groupIdsByLocalId,
        observationIdsByLocalId,
      });
      await saveBehavioralMapPersonObservationLinks({
        tx,
        behavioralMapId: data.behavioralMapId,
        links: data.links,
        observationIdsByLocalId,
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
