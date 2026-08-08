import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { finalizedTallyArraySchema, ongoingTallySchema } from "@zodValidators";
import { z } from "zod";

export const fetchTallysParamsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
});

export type FetchTallysParams = z.infer<typeof fetchTallysParamsSchema>;

export type FetchTallysResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallys>>["data"]
>;
export const fetchTallys = async (params: FetchTallysParams) => {
  let isFinalizedFilter = undefined;
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
        location: {
          id: params.locationId,
          cityId: params.cityId,
          narrowAdministrativeUnitId: params.narrowUnitId,
          intermediateAdministrativeUnitId: params.intermediateUnitId,
          broadAdministrativeUnitId: params.broadUnitId,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isFinalized: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
        location: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        tallys,
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar contagens!",
      } as APIResponseInfo,
      data: {
        tallys: [],
      },
    };
  }
};

export type FetchRecentlyCompletedTallyResponse = NonNullable<
  Awaited<ReturnType<typeof fetchRecentlyCompletedTallys>>["data"]
>;
const fetchRecentlyCompletedTallys = async () => {
  try {
    const tallys = await prisma.tally.findMany({
      where: {
        NOT: {
          isFinalized: false,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isFinalized: true,
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        tallys,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar contagens!",
      } as APIResponseInfo,
      data: {
        tallys: [],
      },
    };
  }
};

export const fetchOngoingTallyParamsSchema = z.object({
  tallyId: z.coerce.number(),
});

export type FetchOngoingTallyParams = z.infer<
  typeof fetchOngoingTallyParamsSchema
>;

export type FetchOngoingTallyResponse = NonNullable<
  Awaited<ReturnType<typeof fetchOngoingTallyById>>
>["data"];

const fetchOngoingTallyById = async (tallyId: number) => {
  try {
    const tally = await prisma.tally.findUnique({
      where: {
        id: tallyId,
      },
      select: {
        tallyPerson: true,
        location: {
          select: {
            name: true,
          },
        },
        startDate: true,
        endDate: true,
        updatedAt: true,
        isFinalized: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        animalsAmount: true,
        temperature: true,
        weatherCondition: true,
        groups: true,
        commercialActivities: true,
      },
    });
    const parsedTally = ongoingTallySchema.safeParse(tally);
    if (!parsedTally.success) {
      return {
        responseInfo: { statusCode: 400 } as APIResponseInfo,
        data: { tally: null },
      };
    }
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { tally: parsedTally.data },
    };
  } catch (error) {
    return {
      responseInfo: { statusCode: 500 } as APIResponseInfo,
      data: { tally: null },
    };
  }
};

export type FetchTallyUsersResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallyUsers>>
>["data"];

export const fetchTallyUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: { tally: { some: {} } },
      select: { id: true, username: true },
    });
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        users,
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar avaliadores!",
      } as APIResponseInfo,
      data: {
        users: [],
      },
    };
  }
};

export const fetchFinalizedTallysDataVisualizationParamsSchema = z.object({
  tallyIds: z
    .string()
    .or(z.array(z.coerce.number()))
    .transform((value) =>
      Array.isArray(value) ? value : (
        value.split(",").map((id) => z.coerce.number().parse(id))
      ),
    ),
});

export type FetchFinalizedTallysDataVisualizationParams = z.infer<
  typeof fetchFinalizedTallysDataVisualizationParamsSchema
>;

export type FetchFinalizedTallysDataVisualizationResponse = NonNullable<
  Awaited<ReturnType<typeof fetchFinalizedTallysToDataVisualization>>
>["data"];

const fetchFinalizedTallysToDataVisualization = async (tallysIds: number[]) => {
  try {
    const tallys = await prisma.tally.findMany({
      where: {
        id: {
          in: tallysIds,
        },
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        location: {
          select: {
            name: true,
            usableArea: true,
          },
        },
      },
    });
    const locationName = tallys[0]?.location.name ?? "ERRO";
    const usableArea = tallys[0]?.location.usableArea ?? null;
    const parsedTallys = finalizedTallyArraySchema.safeParse(tallys);
    if (!parsedTallys.success) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Erro ao consultar contagens!",
        } as APIResponseInfo,
        data: { tallys: null, locationName: null, usableArea: null },
      };
    }
    const filteredParsedTallys = parsedTallys.data.filter((tally) => {
      if (tally.isFinalized) return true;
    });
    filteredParsedTallys.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    );
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        tallys: filteredParsedTallys,
        locationName,
        usableArea,
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar contagens!",
      } as APIResponseInfo,
      data: { tallys: null, locationName: null, usableArea: null },
    };
  }
};

export {
  fetchRecentlyCompletedTallys,
  fetchOngoingTallyById,
  fetchFinalizedTallysToDataVisualization,
};
