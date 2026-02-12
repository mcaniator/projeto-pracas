import { FetchTallysParams } from "@/app/api/admin/tallys/route";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { finalizedTallyArraySchema, ongoingTallySchema } from "@zodValidators";

export type FetchTallysResponse = NonNullable<
  Awaited<ReturnType<typeof fetchTallys>>["data"]
>;
export const fetchTallys = async (params: FetchTallysParams) => {
  try {
    const tallys = await prisma.tally.findMany({
      where: {
        startDate: {
          gte: params.startDate,
          lte: params.endDate,
        },
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

const fetchTallysByLocationId = async (locationId: number) => {
  try {
    const tallys = await prisma.tally.findMany({
      where: {
        locationId: locationId,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });
    tallys.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    return { statusCode: 200, tallys };
  } catch (error) {
    return { statusCode: 500, tallys: [] };
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
          endDate: null,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
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

const fetchOngoingTallyById = async (tallyId: number) => {
  try {
    const tally = await prisma.tally.findUnique({
      where: {
        id: tallyId,
      },
      select: {
        tallyPerson: true,
        locationId: true,
        location: {
          select: {
            name: true,
          },
        },
        startDate: true,
        endDate: true,
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
      return { statusCode: 400, tally: null };
    }
    return {
      statusCode: 200,
      tally: parsedTally.data,
    };
  } catch (error) {
    return { statusCode: 500, tally: null };
  }
};

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
          },
        },
      },
    });
    const locationName = tallys[0]?.location.name ?? "ERRO";
    const parsedTallys = finalizedTallyArraySchema.safeParse(tallys);
    if (!parsedTallys.success) {
      return { statusCode: 400, tallys: null };
    }
    const filteredParsedTallys = parsedTallys.data.filter((tally) => {
      if (tally.endDate) return true;
    });
    filteredParsedTallys.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    );
    return { statusCode: 200, tallys: filteredParsedTallys, locationName };
  } catch (error) {
    return { statusCode: 500, tallys: null, locationName: null };
  }
};

export {
  fetchTallysByLocationId,
  fetchRecentlyCompletedTallys,
  fetchOngoingTallyById,
  fetchFinalizedTallysToDataVisualization,
};
