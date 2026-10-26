import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import {
  APIRequest,
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { booleanFromString } from "@/lib/zodValidators";
import { prisma } from "@lib/prisma";
import { z } from "zod";

import { getFormSubmissionData } from "./formSubmission";

export const fetchTallyProtocolsParamsSchema = z.object({
  finalizedOnly: booleanFromString.nullish(),
  includeArchived: booleanFromString.nullish(),
});

export type FetchTallyProtocolsParams = z.infer<
  typeof fetchTallyProtocolsParamsSchema
>;

export type FetchTallyProtocolsResponse = Awaited<
  ReturnType<typeof fetchTallyProtocols>
>["data"];

export const fetchTallyProtocols = async (
  request: APIRequestParams<FetchTallyProtocolsParams>,
) => {
  const params = request.params!;

  try {
    const tallyProtocols = await prisma.tallyProtocol.findMany({
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
        _count: { select: { tally: true } },
      },
      orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { tallyProtocols },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar protocolos de contagem!",
      } as APIResponseInfo,
      data: { tallyProtocols: [] },
    };
  }
};

export const fetchTallysParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  tallyProtocolId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
  page: z.coerce.number().int().positive(),
  itemsPerPage: z.coerce.number().int().positive().max(100),
});

export type FetchTallysParams = z.infer<
  typeof fetchTallysParamsSchema
>;

export type FetchTallysResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallys>>["data"]
>;

export const fetchTallys = async (
  request: APIRequestParams<FetchTallysParams>,
) => {
  const params = request.params!;
  let isFinalizedFilter: boolean | undefined;

  if (params.finalizationStatus === FINALIZATION_STATUS.FINALIZED) {
    isFinalizedFilter = true;
  } else if (params.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED) {
    isFinalizedFilter = false;
  }

  try {
    const tallys = await prisma.tally.findMany({
      where: {
        startDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
        isFinalized: isFinalizedFilter,
        userId: params.userId,
        tallyProtocolId: params.tallyProtocolId,
        location: {
          id: params.locationId,
          cityId: params.cityId,
          narrowAdministrativeUnitId: params.narrowUnitId,
          intermediateAdministrativeUnitId: params.intermediateUnitId,
          broadAdministrativeUnitId: params.broadUnitId,
        },
      },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      skip: (params.page - 1) * params.itemsPerPage,
      take: params.itemsPerPage + 1,
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
        tallyProtocol: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const hasMore = tallys.length > params.itemsPerPage;
    const slicedTallys = tallys.slice(0, params.itemsPerPage);

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { tallys: slicedTallys, hasMore },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar contagens!",
      } as APIResponseInfo,
      data: { tallys: [], hasMore: false },
    };
  }
};

export type FetchTallyUsersResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallyUsers>>["data"]
>;

export const fetchTallyUsers = async (_request: APIRequest) => {
  try {
    const users = await prisma.user.findMany({
      where: { tally: { some: {} } },
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

export const fetchTallyProtocolStructureParamsSchema = z.object({
  tallyProtocolId: z.coerce.number().int().positive(),
});

export type FetchTallyProtocolStructureParams = z.infer<
  typeof fetchTallyProtocolStructureParamsSchema
>;

export type FetchTallyProtocolStructureResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallyProtocolStructure>>["data"]
>;

export type GetTallyProtocolStructureParams = {
  tallyProtocolId: number;
};

export const getTallyProtocolStructure = async ({
  tallyProtocolId,
}: GetTallyProtocolStructureParams) => {
  const tallyProtocol = await prisma.tallyProtocol.findUnique({
    where: { id: tallyProtocolId },
    select: {
      id: true,
      name: true,
      archived: true,
      finalized: true,
      form: {
        select: {
          id: true,
          name: true,
        },
      },
      tallyProtocolGroups: {
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

  if (!tallyProtocol) {
    throw new Error("Protocolo de contagem não encontrado");
  }

  return tallyProtocol;
};

export type GetTallyProtocolStructureResult = Awaited<
  ReturnType<typeof getTallyProtocolStructure>
>;

export const fetchTallyProtocolStructure = async (
  request: APIRequestParams<FetchTallyProtocolStructureParams>,
) => {
  const params = request.params!;

  try {
    const tallyProtocol = await getTallyProtocolStructure({
      tallyProtocolId: params.tallyProtocolId,
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { tallyProtocol },
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

export type GetTallySubmissionDataParams = {
  tallyId: number;
};

export const getTallySubmissionData = async ({
  tallyId,
}: GetTallySubmissionDataParams) => {
  const tally = await prisma.tally.findUnique({
    where: { id: tallyId },
    select: {
      tallyProtocolId: true,
      formSubmissionId: true,
    },
  });

  if (!tally) {
    throw new Error("Contagem não encontrada");
  }

  const [tallyProtocolStructure, personObservations, formSubmission] =
    await Promise.all([
      getTallyProtocolStructure({
        tallyProtocolId: tally.tallyProtocolId,
      }),
      prisma.personObservation.findMany({
        where: { tallyId },
        orderBy: { id: "asc" },
        select: {
          id: true,
          quantity: true,
          characteristics: {
            orderBy: { personCharacteristicId: "asc" },
            select: { personCharacteristicId: true },
          },
        },
      }),
      tally.formSubmissionId ?
        getFormSubmissionData({
          formSubmissionId: tally.formSubmissionId,
          includeCalculations: true,
        })
      : Promise.resolve(null),
    ]);

  return {
    formSubmission,
    tallyProtocolStructure,
    personObservations,
  };
};

export type GetTallySubmissionDataResult = Awaited<
  ReturnType<typeof getTallySubmissionData>
>;

export const fetchTallyDetailsParamsSchema = z.object({
  tallyId: z.coerce.number().int().positive(),
});

export type FetchTallyDetailsParams = z.infer<
  typeof fetchTallyDetailsParamsSchema
>;

export type FetchTallyDetailsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallyDetails>>["data"]
>;

export type TallyLocationPolygon = {
  st_asgeojson: string | null;
};

export const fetchTallyDetails = async (
  request: APIRequestParams<FetchTallyDetailsParams>,
) => {
  const params = request.params!;

  try {
    const tally = await prisma.tally.findUnique({
      where: { id: params.tallyId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isFinalized: true,
        updatedAt: true,
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
      },
    });

    if (!tally) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Contagem não encontrada!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const [tallySubmission, locationPolygon] = await Promise.all([
      getTallySubmissionData({
        tallyId: tally.id,
      }),
      prisma.$queryRaw<Array<TallyLocationPolygon>>`
        SELECT
          CASE
            WHEN ST_IsEmpty(l.polygon) THEN NULL
            ELSE ST_AsGeoJSON(l.polygon)::text
          END AS st_asgeojson
        FROM location l
        WHERE l.id = ${tally.location.id}
      `,
    ]);

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        tallyDetails: {
          id: tally.id,
          startDate: tally.startDate,
          endDate: tally.endDate,
          isFinalized: tally.isFinalized,
          updatedAt: tally.updatedAt,
          user: tally.user,
          location: {
            ...tally.location,
            st_asgeojson: locationPolygon[0]?.st_asgeojson ?? null,
          },
          tallySubmission,
        },
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar contagem!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
