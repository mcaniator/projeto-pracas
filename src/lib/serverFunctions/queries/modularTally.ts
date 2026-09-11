import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { booleanFromString } from "@/lib/zodValidators";
import { prisma } from "@lib/prisma";
import { z } from "zod";

export const fetchModularTallyTemplatesParamsSchema = z.object({
  finalizedOnly: booleanFromString.nullish(),
  includeArchived: booleanFromString.nullish(),
});

export type FetchModularTallyTemplatesParams = z.infer<
  typeof fetchModularTallyTemplatesParamsSchema
>;

export type FetchModularTallyTemplatesResponse = Awaited<
  ReturnType<typeof fetchModularTallyTemplates>
>["data"];

export const fetchModularTallyTemplates = async (
  request: APIRequestParams<FetchModularTallyTemplatesParams>,
) => {
  const params = request.params!;

  try {
    const modularTallyTemplates = await prisma.modularTallyTemplate.findMany({
      where: {
        ...(params.finalizedOnly && { finalized: true }),
        ...(!params.includeArchived && { archived: false }),
      },
      select: {
        id: true,
        name: true,
        finalized: true,
        archived: true,
        updatedAt: true,
        _count: { select: { modularTally: true } },
      },
      orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { modularTallyTemplates },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar protocolos de contagem!",
      } as APIResponseInfo,
      data: { modularTallyTemplates: [] },
    };
  }
};

export const fetchModularTallyTemplateStructureParamsSchema = z.object({
  modularTallyTemplateId: z.coerce.number().int().positive(),
});

export type FetchModularTallyTemplateStructureParams = z.infer<
  typeof fetchModularTallyTemplateStructureParamsSchema
>;

export type FetchModularTallyTemplateStructureResponse = Awaited<
  ReturnType<typeof fetchModularTallyTemplateStructure>
>["data"];

export const fetchModularTallyTemplateStructure = async (
  request: APIRequestParams<FetchModularTallyTemplateStructureParams>,
) => {
  const params = request.params!;

  try {
    const modularTallyTemplate = await prisma.modularTallyTemplate.findUnique({
      where: { id: params.modularTallyTemplateId },
      select: {
        id: true,
        name: true,
        finalized: true,
        tallyTemplateGroups: {
          select: {
            id: true,
            position: true,
            displayMode: true,
            personCharacteristicGroup: {
              select: {
                id: true,
                title: true,
                isTagGroup: true,
              },
            },
            characteristics: {
              select: {
                id: true,
                position: true,
                personCharacteristic: {
                  select: {
                    id: true,
                    name: true,
                    iconKey: true,
                    color: true,
                  },
                },
              },
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!modularTallyTemplate) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Protocolo de contagem não encontrado!",
        } as APIResponseInfo,
        data: { modularTallyTemplate: null },
      };
    }

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { modularTallyTemplate },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar protocolo de contagem!",
      } as APIResponseInfo,
      data: { modularTallyTemplate: null },
    };
  }
};
