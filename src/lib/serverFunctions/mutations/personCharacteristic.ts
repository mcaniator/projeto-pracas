import { prisma } from "@/lib/prisma";
import { isSupportedDynamicIconKey } from "@/lib/serverFunctions/queries/questionIcon";
import {
  APIRequestData,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

const personCharacteristicColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida");

export const savePersonCharacteristicGroupDataSchema = z.object({
  personCharacteristicGroupId: z.number().int().positive().optional(),
  title: z.string().trim().min(1).max(255),
  isTagGroup: z.boolean(),
});

export type SavePersonCharacteristicGroupData = z.infer<
  typeof savePersonCharacteristicGroupDataSchema
>;

export const savePersonCharacteristicGroup = async (
  request: APIRequestData<SavePersonCharacteristicGroupData>,
) => {
  const data = request.data!;

  try {
    if (data.personCharacteristicGroupId) {
      const currentGroup = await prisma.personCharacteristicGroup.findUnique({
        where: { id: data.personCharacteristicGroupId },
        select: { isTagGroup: true },
      });

      if (!currentGroup) {
        return {
          responseInfo: {
            statusCode: 404,
            message: "Grupo de características não encontrado!",
          } as APIResponseInfo,
          data: null,
        };
      }

      if (currentGroup.isTagGroup !== data.isTagGroup) {
        const [templateUses, observationUses] = await Promise.all([
          prisma.tallyTemplateGroup.count({
            where: {
              personCharacteristicGroupId: data.personCharacteristicGroupId,
            },
          }),
          prisma.personObservationCharacteristic.count({
            where: {
              personCharacteristic: {
                groupId: data.personCharacteristicGroupId,
              },
            },
          }),
        ]);

        if (templateUses > 0 || observationUses > 0) {
          return {
            responseInfo: {
              statusCode: 409,
              message:
                "O tipo do grupo não pode ser alterado porque ele já está em uso.",
            } as APIResponseInfo,
            data: null,
          };
        }
      }

      const personCharacteristicGroup =
        await prisma.personCharacteristicGroup.update({
          where: { id: data.personCharacteristicGroupId },
          data: {
            title: data.title,
            isTagGroup: data.isTagGroup,
          },
          select: { title: true },
        });

      return {
        responseInfo: {
          statusCode: 200,
          message: `Grupo "${personCharacteristicGroup.title}" editado com sucesso!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    const personCharacteristicGroup =
      await prisma.personCharacteristicGroup.create({
        data: {
          title: data.title,
          isTagGroup: data.isTagGroup,
        },
        select: { title: true },
      });

    return {
      responseInfo: {
        statusCode: 201,
        message: `Grupo "${personCharacteristicGroup.title}" criado com sucesso!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar grupo de características!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const deletePersonCharacteristicGroupDataSchema = z.object({
  personCharacteristicGroupId: z.number().int().positive(),
});

export type DeletePersonCharacteristicGroupData = z.infer<
  typeof deletePersonCharacteristicGroupDataSchema
>;

export const deletePersonCharacteristicGroup = async (
  request: APIRequestData<DeletePersonCharacteristicGroupData>,
) => {
  const data = request.data!;

  try {
    const personCharacteristicGroup =
      await prisma.personCharacteristicGroup.findUnique({
        where: { id: data.personCharacteristicGroupId },
        select: { title: true },
      });

    if (!personCharacteristicGroup) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Grupo de características não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const [templateGroupUses, templateCharacteristicUses, observationUses] =
      await Promise.all([
        prisma.tallyTemplateGroup.count({
          where: {
            personCharacteristicGroupId: data.personCharacteristicGroupId,
          },
        }),
        prisma.tallyTemplateCharacteristic.count({
          where: {
            personCharacteristic: {
              groupId: data.personCharacteristicGroupId,
            },
          },
        }),
        prisma.personObservationCharacteristic.count({
          where: {
            personCharacteristic: {
              groupId: data.personCharacteristicGroupId,
            },
          },
        }),
      ]);

    if (
      templateGroupUses > 0 ||
      templateCharacteristicUses > 0 ||
      observationUses > 0
    ) {
      return {
        responseInfo: {
          statusCode: 409,
          message:
            "Este grupo não pode ser excluído porque já está em uso em protocolos ou observações.",
        } as APIResponseInfo,
        data: null,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.personCharacteristic.deleteMany({
        where: { groupId: data.personCharacteristicGroupId },
      });
      await tx.personCharacteristicGroup.delete({
        where: { id: data.personCharacteristicGroupId },
      });
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: `Grupo "${personCharacteristicGroup.title}" excluído com sucesso!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir grupo de características!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const savePersonCharacteristicDataSchema = z.object({
  personCharacteristicId: z.number().int().positive().optional(),
  personCharacteristicGroupId: z.number().int().positive(),
  name: z.string().trim().min(1).max(255),
  iconKey: z.string().trim().min(1).max(255),
  color: personCharacteristicColorSchema,
});

export type SavePersonCharacteristicData = z.infer<
  typeof savePersonCharacteristicDataSchema
>;

export const savePersonCharacteristic = async (
  request: APIRequestData<SavePersonCharacteristicData>,
) => {
  const data = request.data!;

  if (!(await isSupportedDynamicIconKey(data.iconKey))) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Ícone inválido!",
      } as APIResponseInfo,
      data: null,
    };
  }

  try {
    if (data.personCharacteristicId) {
      const personCharacteristic = await prisma.personCharacteristic.update({
        where: { id: data.personCharacteristicId },
        data: {
          name: data.name,
          iconKey: data.iconKey,
          color: data.color,
        },
        select: { name: true },
      });

      return {
        responseInfo: {
          statusCode: 200,
          message: `Característica "${personCharacteristic.name}" editada com sucesso!`,
        } as APIResponseInfo,
        data: null,
      };
    }

    const groupExists = await prisma.personCharacteristicGroup.findUnique({
      where: { id: data.personCharacteristicGroupId },
      select: { id: true },
    });

    if (!groupExists) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Grupo de características não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const personCharacteristic = await prisma.personCharacteristic.create({
      data: {
        groupId: data.personCharacteristicGroupId,
        name: data.name,
        iconKey: data.iconKey,
        color: data.color,
      },
      select: { name: true },
    });

    return {
      responseInfo: {
        statusCode: 201,
        message: `Característica "${personCharacteristic.name}" criada com sucesso!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar característica!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export const deletePersonCharacteristicDataSchema = z.object({
  personCharacteristicId: z.number().int().positive(),
});

export type DeletePersonCharacteristicData = z.infer<
  typeof deletePersonCharacteristicDataSchema
>;

export const deletePersonCharacteristic = async (
  request: APIRequestData<DeletePersonCharacteristicData>,
) => {
  const data = request.data!;

  try {
    const personCharacteristic = await prisma.personCharacteristic.findUnique({
      where: { id: data.personCharacteristicId },
      select: { name: true },
    });

    if (!personCharacteristic) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Característica não encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const [templateUses, observationUses] = await Promise.all([
      prisma.tallyTemplateCharacteristic.count({
        where: { personCharacteristicId: data.personCharacteristicId },
      }),
      prisma.personObservationCharacteristic.count({
        where: { personCharacteristicId: data.personCharacteristicId },
      }),
    ]);

    if (templateUses > 0 || observationUses > 0) {
      return {
        responseInfo: {
          statusCode: 409,
          message:
            "Esta característica não pode ser excluída porque já está em uso em protocolos ou observações.",
        } as APIResponseInfo,
        data: null,
      };
    }

    await prisma.personCharacteristic.delete({
      where: { id: data.personCharacteristicId },
    });

    return {
      responseInfo: {
        statusCode: 200,
        message: `Característica "${personCharacteristic.name}" excluída com sucesso!`,
      } as APIResponseInfo,
      data: null,
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao excluir característica!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
