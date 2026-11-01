import { prisma } from "@/lib/prisma";
import { APIRequestData, APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const createBehavioralMapProtocolDataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  cloneBehavioralMapProtocolId: z.number().int().positive().optional(),
});
export type CreateBehavioralMapProtocolData = z.infer<typeof createBehavioralMapProtocolDataSchema>;

export const createBehavioralMapProtocol = async (
  request: APIRequestData<CreateBehavioralMapProtocolData>,
) => {
  const data = request.data!;
  try {
    const source = data.cloneBehavioralMapProtocolId ?
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
        responseInfo: { statusCode: 404, message: "Protocolo de mapa comportamental não encontrado!" } as APIResponseInfo,
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
      responseInfo: { statusCode: 200, message: "Protocolo de mapa comportamental criado com sucesso!" } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao criar protocolo de mapa comportamental!" } as APIResponseInfo,
      data: null,
    };
  }
};

export const updateBehavioralMapProtocolArchiveStatusDataSchema = z.object({
  behavioralMapProtocolId: z.number().int().positive(),
  archived: z.boolean(),
});
export type UpdateBehavioralMapProtocolArchiveStatusData = z.infer<typeof updateBehavioralMapProtocolArchiveStatusDataSchema>;

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
        responseInfo: { statusCode: 404, message: "Protocolo de mapa comportamental não encontrado!" } as APIResponseInfo,
        data: null,
      };
    }

    if (!data.archived) {
      await prisma.behavioralMapProtocol.update({
        where: { id: data.behavioralMapProtocolId },
        data: { archived: false },
      });
      return {
        responseInfo: { statusCode: 200, message: "Protocolo de mapa comportamental restaurado com sucesso!" } as APIResponseInfo,
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
        responseInfo: { statusCode: 200, message: `Protocolo de mapa comportamental "${protocol.name}" arquivado com sucesso!` } as APIResponseInfo,
        data: null,
      };
    }

    await prisma.behavioralMapProtocol.delete({
      where: { id: data.behavioralMapProtocolId },
    });
    return {
      responseInfo: { statusCode: 200, message: `Protocolo de mapa comportamental "${protocol.name}" excluído com sucesso!` } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao atualizar protocolo de mapa comportamental!" } as APIResponseInfo,
      data: null,
    };
  }
};

