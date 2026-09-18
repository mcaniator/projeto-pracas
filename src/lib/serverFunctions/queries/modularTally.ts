import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import {
  APIRequest,
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

export const fetchModularTallysParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  modularTallyTemplateId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
});

export type FetchModularTallysParams = z.infer<
  typeof fetchModularTallysParamsSchema
>;

export type FetchModularTallysResponse = NonNullable<
  Awaited<ReturnType<typeof fetchModularTallys>>["data"]
>;

export const fetchModularTallys = async (
  request: APIRequestParams<FetchModularTallysParams>,
) => {
  const params = request.params!;
  let isFinalizedFilter: boolean | undefined;

  if (params.finalizationStatus === FINALIZATION_STATUS.FINALIZED) {
    isFinalizedFilter = true;
  } else if (params.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED) {
    isFinalizedFilter = false;
  }

  try {
    const modularTallys = await prisma.modularTally.findMany({
      where: {
        startDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
        isFinalized: isFinalizedFilter,
        userId: params.userId,
        modularTallyTemplateId: params.modularTallyTemplateId,
        location: {
          id: params.locationId,
          cityId: params.cityId,
          narrowAdministrativeUnitId: params.narrowUnitId,
          intermediateAdministrativeUnitId: params.intermediateUnitId,
          broadAdministrativeUnitId: params.broadUnitId,
        },
      },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isFinalized: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        modularTallyTemplate: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { modularTallys },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar contagens!",
      } as APIResponseInfo,
      data: { modularTallys: [] },
    };
  }
};

export type FetchModularTallyUsersResponse = NonNullable<
  Awaited<ReturnType<typeof fetchModularTallyUsers>>["data"]
>;

export const fetchModularTallyUsers = async (_request: APIRequest) => {
  try {
    const users = await prisma.user.findMany({
      where: { modularTally: { some: {} } },
      select: { id: true, username: true },
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { users },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar responsáveis!",
      } as APIResponseInfo,
      data: { users: [] },
    };
  }
};

export const fetchModularTallyTemplateStructureParamsSchema = z.object({
  modularTallyTemplateId: z.coerce.number().int().positive(),
});

export type FetchModularTallyTemplateStructureParams = z.infer<
  typeof fetchModularTallyTemplateStructureParamsSchema
>;

export type FetchModularTallyTemplateStructureResponse = NonNullable<
  Awaited<ReturnType<typeof fetchModularTallyTemplateStructure>>["data"]
>;

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
        data: null,
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
      data: null,
    };
  }
};
