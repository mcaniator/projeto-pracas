import { PublicFetchTallysParams } from "@/app/api/public/tallys/route";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";

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
