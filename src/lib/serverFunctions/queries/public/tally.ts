import { PublicFetchTallyDetailsParams } from "@/app/api/public/tallyDetails/route";
import { PublicFetchTallysParams } from "@/app/api/public/tallys/route";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { tallySchema } from "@zodValidators";
import { z } from "zod";

const publicFinalizedTallySchema = tallySchema.omit({
  location: true,
  user: true,
});

export type PublicFinalizedTally = z.infer<typeof publicFinalizedTallySchema>;

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
      select: {
        id: true,
        locationId: true,
        startDate: true,
        endDate: true,
        animalsAmount: true,
        temperature: true,
        weatherCondition: true,
        groups: true,
        tallyPerson: true,
        commercialActivities: true,
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

    const parsedTally = publicFinalizedTallySchema.safeParse({
      id: tally.id,
      locationId: tally.locationId,
      startDate: tally.startDate,
      endDate: tally.endDate,
      animalsAmount: tally.animalsAmount,
      temperature: tally.temperature,
      weatherCondition: tally.weatherCondition,
      groups: tally.groups,
      tallyPerson: tally.tallyPerson,
      commercialActivities: tally.commercialActivities,
    });
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
        tally: parsedTally.data,
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
