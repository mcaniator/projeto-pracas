import { prisma } from "@/lib/prisma";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const createBehavioralMapProtocolDataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  cloneBehavioralMapProtocolId: z.number().int().positive().optional(),
});
export type CreateBehavioralMapProtocolData = z.infer<
  typeof createBehavioralMapProtocolDataSchema
>;

export const createBehavioralMapProtocol = async (
  request: APIRequestData<CreateBehavioralMapProtocolData>,
) => {
  const data = request.data!;
  try {
    const source =
      data.cloneBehavioralMapProtocolId ?
        await prisma.behavioralMapProtocol.findUnique({
          where: { id: data.cloneBehavioralMapProtocolId },
          select: {
            formId: true,
            behavioralMapProtocolGroups: {
              orderBy: { position: "asc" },
              select: {
                personCharacteristicGroupId: true,
                position: true,
                characteristics: {
                  orderBy: { position: "asc" },
                  select: { personCharacteristicId: true, position: true },
                },
              },
            },
          },
        })
      : null;

    if (data.cloneBehavioralMapProtocolId && !source) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de mapa comportamental não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (source) {
      await prisma.$transaction(async (tx) => {
        const behavioralMapProtocol = await tx.behavioralMapProtocol.create({
          data: {
            name: data.name,
            formId: source.formId,
          },
          select: { id: true },
        });

        const groupValues = source.behavioralMapProtocolGroups.map(
          (group) =>
            Prisma.sql`(${behavioralMapProtocol.id}, ${group.personCharacteristicGroupId}, ${group.position})`,
        );

        if (groupValues.length === 0) return;

        const createdGroups = await tx.$queryRaw<
          { id: number; person_characteristic_group_id: number }[]
        >(Prisma.sql`
          INSERT INTO "behavioral_map_protocol_group" (
            "behavioral_map_protocol_id",
            "person_characteristic_group_id",
            "position"
          )
          VALUES ${Prisma.join(groupValues, ",")}
          RETURNING "id", "person_characteristic_group_id"
        `);

        const createdGroupIds = new Map(
          createdGroups.map((group) => [
            group.person_characteristic_group_id,
            group.id,
          ]),
        );
        const characteristicValues = source.behavioralMapProtocolGroups.flatMap(
          (group) => {
            const behavioralMapProtocolGroupId = createdGroupIds.get(
              group.personCharacteristicGroupId,
            );
            if (!behavioralMapProtocolGroupId) {
              throw new Error("Grupo do protocolo clonado não encontrado");
            }

            return group.characteristics.map(
              (characteristic) =>
                Prisma.sql`(${behavioralMapProtocolGroupId}, ${characteristic.personCharacteristicId}, ${characteristic.position})`,
            );
          },
        );

        if (characteristicValues.length > 0) {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO "behavioral_map_protocol_characteristic" (
              "behavioral_map_protocol_group_id",
              "person_characteristic_id",
              "position"
            )
            VALUES ${Prisma.join(characteristicValues, ",")}
          `);
        }
      });
    } else {
      await prisma.behavioralMapProtocol.create({
        data: { name: data.name },
      });
    }
    return {
      responseInfo: {
        statusCode: 200,
        message: "Protocolo de mapa comportamental criado com sucesso!",
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar protocolo de mapa comportamental!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const updateBehavioralMapProtocolArchiveStatusDataSchema = z.object({
  behavioralMapProtocolId: z.number().int().positive(),
  archived: z.boolean(),
});

export const updateBehavioralMapProtocolDataSchema = z.object({
  behavioralMapProtocolId: z.number().int().positive(),
  formId: z.number().int().positive().nullable(),
  name: z.string().trim().min(1).max(255),
  finalized: z.boolean(),
  groups: z
    .array(
      z.object({
        personCharacteristicGroupId: z.number().int().positive(),
        position: z.number().int().positive(),
        characteristics: z.array(
          z.object({
            personCharacteristicId: z.number().int().positive(),
            position: z.number().int().positive(),
          }),
        ),
      }),
    )
    .superRefine((groups, ctx) => {
      const ids = new Set<number>();
      groups.forEach((group, index) => {
        if (ids.has(group.personCharacteristicGroupId))
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Grupo duplicado.",
            path: [index, "personCharacteristicGroupId"],
          });
        ids.add(group.personCharacteristicGroupId);
        const chars = new Set<number>();
        group.characteristics.forEach((characteristic, charIndex) => {
          if (chars.has(characteristic.personCharacteristicId))
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Característica duplicada.",
              path: [index, "characteristics", charIndex],
            });
          chars.add(characteristic.personCharacteristicId);
        });
      });
    }),
});
export type UpdateBehavioralMapProtocolData = z.infer<
  typeof updateBehavioralMapProtocolDataSchema
>;

export const updateBehavioralMapProtocol = async (
  request: APIRequestData<UpdateBehavioralMapProtocolData>,
) => {
  const data = request.data!;
  try {
    const current = await prisma.behavioralMapProtocol.findFirst({
      where: { id: data.behavioralMapProtocolId, finalized: false },
      select: { id: true },
    });
    if (!current)
      return {
        responseInfo: {
          statusCode: 400,
          message:
            "O protocolo de mapa comportamental não foi encontrado ou já está finalizado.",
        } as APIResponseInfo,
        data: null,
      };
    if (data.formId !== null) {
      const form = await prisma.form.findFirst({
        where: {
          id: data.formId,
          formUse: "TALLY_AND_BEHAVIORAL_MAP",
          finalized: true,
          archived: false,
        },
        select: { id: true },
      });
      if (!form)
        return {
          responseInfo: {
            statusCode: 400,
            message: "O formulário selecionado não está disponível para uso.",
          } as APIResponseInfo,
          data: null,
        };
    }
    await prisma.$transaction(async (tx) => {
      await tx.behavioralMapProtocol.update({
        where: { id: current.id },
        data: {
          name: data.name,
          formId: data.formId,
          finalized: data.finalized,
        },
      });
      await tx.$executeRaw`DELETE FROM "behavioral_map_protocol_group" WHERE "behavioral_map_protocol_id" = ${current.id}`;
      if (!data.groups.length) return;
      const inserted = await tx.$queryRaw<
        { id: number; person_characteristic_group_id: number }[]
      >(Prisma.sql`
        INSERT INTO "behavioral_map_protocol_group" ("behavioral_map_protocol_id", "person_characteristic_group_id", "position")
        VALUES ${Prisma.join(
          data.groups.map(
            (g) =>
              Prisma.sql`(${current.id}, ${g.personCharacteristicGroupId}, ${g.position})`,
          ),
          ",",
        )}
        RETURNING "id", "person_characteristic_group_id"
      `);
      const groupIds = new Map(
        inserted.map((g) => [g.person_characteristic_group_id, g.id]),
      );
      const values = data.groups.flatMap((g) =>
        g.characteristics.map(
          (c) =>
            Prisma.sql`(${groupIds.get(g.personCharacteristicGroupId)}, ${c.personCharacteristicId}, ${c.position})`,
        ),
      );
      if (values.length)
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO "behavioral_map_protocol_characteristic" ("behavioral_map_protocol_group_id", "person_characteristic_id", "position") VALUES ${Prisma.join(values, ",")}`,
        );
    });
    return {
      responseInfo: {
        statusCode: 200,
        message: "Protocolo de mapa comportamental salvo com sucesso!",
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar protocolo de mapa comportamental!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
export type UpdateBehavioralMapProtocolArchiveStatusData = z.infer<
  typeof updateBehavioralMapProtocolArchiveStatusDataSchema
>;

export const updateBehavioralMapProtocolArchiveStatus = async (
  request: APIRequestData<UpdateBehavioralMapProtocolArchiveStatusData>,
) => {
  const data = request.data!;
  try {
    const protocol = await prisma.behavioralMapProtocol.findUnique({
      where: { id: data.behavioralMapProtocolId },
      select: { name: true },
    });
    if (!protocol) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de mapa comportamental não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (!data.archived) {
      await prisma.behavioralMapProtocol.update({
        where: { id: data.behavioralMapProtocolId },
        data: { archived: false },
      });
      return {
        responseInfo: {
          statusCode: 200,
          message: "Protocolo de mapa comportamental restaurado com sucesso!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const mapCount = await prisma.behavioralMap.count({
      where: { behavioralMapProtocolId: data.behavioralMapProtocolId },
    });
    if (mapCount > 0) {
      await prisma.behavioralMapProtocol.update({
        where: { id: data.behavioralMapProtocolId },
        data: { archived: true },
      });
      return {
        responseInfo: {
          statusCode: 200,
          message: `Protocolo de mapa comportamental "${protocol.name}" arquivado com sucesso!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    await prisma.behavioralMapProtocol.delete({
      where: { id: data.behavioralMapProtocolId },
    });
    return {
      responseInfo: {
        statusCode: 200,
        message: `Protocolo de mapa comportamental "${protocol.name}" excluído com sucesso!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao atualizar protocolo de mapa comportamental!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
