import { PublicFetchLocationTypesParams } from "@/app/api/public/locationTypes/route";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";

export type PublicFetchLocationTypesResponse = Awaited<
  ReturnType<typeof publicFetchLocationTypes>
>["data"];

export const publicFetchLocationTypes = async (
  params: PublicFetchLocationTypesParams,
) => {
  try {
    const types = await prisma.locationType.findMany({
      where: {
        locations: {
          some: {
            isPublic: true,
            cityId: params.cityId,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        types,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar tipos de praças!",
      } as APIResponseInfo,
      data: {
        types: [],
      },
    };
  }
};
