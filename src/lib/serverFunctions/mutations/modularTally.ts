import { prisma } from "@/lib/prisma";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const createModularTallyTemplateDataSchema = z.object({
  name: z.string().trim().min(1).max(255),
  cloneModularTallyTemplateId: z.number().int().positive().optional(),
});

export type CreateModularTallyTemplateData = z.infer<
  typeof createModularTallyTemplateDataSchema
>;

export const createModularTallyTemplate = async (
  request: APIRequestData<CreateModularTallyTemplateData>,
) => {
  const data = request.data!;

  try {
    if (data.cloneModularTallyTemplateId) {
      const sourceTemplate = await prisma.modularTallyTemplate.findUnique({
        where: { id: data.cloneModularTallyTemplateId },
        select: {
          tallyTemplateGroups: {
            select: {
              personCharacteristicGroupId: true,
              position: true,
              displayMode: true,
              characteristics: {
                select: {
                  personCharacteristicId: true,
                  position: true,
                },
              },
            },
          },
        },
      });

      if (!sourceTemplate) {
        return {
          responseInfo: {
            statusCode: 404,
            message: "Protocolo de contagem não encontrado!",
          } as APIResponseInfo,
          data: null,
        };
      }

      await prisma.$transaction(async (tx) => {
        const modularTallyTemplate = await tx.modularTallyTemplate.create({
          data: { name: data.name },
          select: { id: true },
        });

        const groupValues = sourceTemplate.tallyTemplateGroups.map(
          (group) =>
            Prisma.sql`(${modularTallyTemplate.id}, ${group.personCharacteristicGroupId}, ${group.position}, ${group.displayMode})`,
        );

        if (groupValues.length === 0) return;

        const createdGroups = await tx.$queryRaw<
          { id: number; person_characteristic_group_id: number }[]
        >(Prisma.sql`
          INSERT INTO "tally_template_group" (
            "modular_tally_template_id",
            "person_characteristic_group_id",
            "position",
            "display_mode"
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
        const characteristicValues = sourceTemplate.tallyTemplateGroups.flatMap(
          (group) => {
            const tallyTemplateGroupId = createdGroupIds.get(
              group.personCharacteristicGroupId,
            );
            if (!tallyTemplateGroupId) {
              throw new Error("Grupo do template clonado não encontrado");
            }

            return group.characteristics.map(
              (characteristic) =>
                Prisma.sql`(${tallyTemplateGroupId}, ${characteristic.personCharacteristicId}, ${characteristic.position})`,
            );
          },
        );

        if (characteristicValues.length > 0) {
          await tx.$executeRaw(Prisma.sql`
            INSERT INTO "tally_template_characteristic" (
              "tally_template_group_id",
              "person_characteristic_id",
              "position"
            )
            VALUES ${Prisma.join(characteristicValues, ",")}
          `);
        }
      });
    } else {
      await prisma.modularTallyTemplate.create({ data: { name: data.name } });
    }

    return {
      responseInfo: {
        statusCode: 200,
        message: "Protocolo de contagem criado com sucesso!",
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao criar protocolo de contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const updateModularTallyTemplateArchiveStatusDataSchema = z.object({
  modularTallyTemplateId: z.number().int().positive(),
  archived: z.boolean(),
});

export type UpdateModularTallyTemplateArchiveStatusData = z.infer<
  typeof updateModularTallyTemplateArchiveStatusDataSchema
>;

export const updateModularTallyTemplateArchiveStatus = async (
  request: APIRequestData<UpdateModularTallyTemplateArchiveStatusData>,
) => {
  const data = request.data!;

  try {
    const modularTallyTemplate = await prisma.modularTallyTemplate.findUnique({
      where: { id: data.modularTallyTemplateId },
      select: { name: true },
    });

    if (!modularTallyTemplate) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de contagem não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    if (!data.archived) {
      await prisma.modularTallyTemplate.update({
        where: { id: data.modularTallyTemplateId },
        data: { archived: false },
      });

      return {
        responseInfo: {
          statusCode: 200,
          message: "Protocolo de contagem restaurado com sucesso!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const modularTallyCount = await prisma.modularTally.count({
      where: { modularTallyTemplateId: data.modularTallyTemplateId },
    });

    if (modularTallyCount > 0) {
      await prisma.modularTallyTemplate.update({
        where: { id: data.modularTallyTemplateId },
        data: { archived: true },
      });

      return {
        responseInfo: {
          statusCode: 200,
          message: `Protocolo de contagem "${modularTallyTemplate.name}" arquivado com sucesso!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.tallyTemplateCharacteristic.deleteMany({
        where: {
          tallyTemplateGroup: {
            modularTallyTemplateId: data.modularTallyTemplateId,
          },
        },
      });
      await tx.tallyTemplateGroup.deleteMany({
        where: { modularTallyTemplateId: data.modularTallyTemplateId },
      });
      await tx.modularTallyTemplate.delete({
        where: { id: data.modularTallyTemplateId },
      });
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: `Protocolo de contagem "${modularTallyTemplate.name}" excluído com sucesso!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao atualizar protocolo de contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
