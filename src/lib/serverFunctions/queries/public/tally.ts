import { PublicFetchTallyDetailsParams } from "@/app/api/public/tallyDetails/route";
import { PublicFetchTallysParams } from "@/app/api/public/tallys/route";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { finalizedTallyArraySchema } from "@zodValidators";

export type PublicFetchTallysResponse = NonNullable<
  Awaited<ReturnType<typeof publicFetchTallys>>["data"]
>;
export const publicFetchTallys = async (params: PublicFetchTallysParams) => {
  try {
    const tallys = await prisma.tally.findMany({
      where: {
        locationId: params.locationId,
        isPublic: true,
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
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

export type PublicFetchTallyDetailsResponse = NonNullable<
  Awaited<ReturnType<typeof publicFetchTallyDetails>>["data"]
>;

export const publicFetchTallyDetails = async (
  params: PublicFetchTallyDetailsParams,
) => {
  if (!params.tallyId) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Id da contagem não informado.",
      } as APIResponseInfo,
      data: {
        tally: null,
        locationName: null,
        usableArea: null,
      },
    };
  }

  try {
    const tally = await prisma.tally.findFirst({
      where: {
        id: params.tallyId,
        isPublic: true,
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

    if (!tally || !tally.endDate) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Contagem não encontrada.",
        } as APIResponseInfo,
        data: {
          tally: null,
          locationName: null,
          usableArea: null,
        },
      };
    }

    const parsedTally = finalizedTallyArraySchema.safeParse([tally]);
    if (!parsedTally.success) {
      return {
        responseInfo: {
          statusCode: 400,
          message: "Erro ao validar contagem.",
        } as APIResponseInfo,
        data: {
          tally: null,
          locationName: null,
          usableArea: null,
        },
      };
    }

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        tally: parsedTally.data[0],
        locationName: tally.location.name,
        usableArea: tally.location.usableArea,
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar detalhes da contagem!",
      } as APIResponseInfo,
      data: {
        tally: null,
        locationName: null,
        usableArea: null,
      },
    };
  }
};
