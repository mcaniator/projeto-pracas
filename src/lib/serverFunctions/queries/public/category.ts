import { PublicFetchCategoriesParams } from "@/app/api/public/locationCategories/route";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";

export type PublicFetchCategoriesResponse = Awaited<
  ReturnType<typeof publicFetchCategories>
>["data"];

export const publicFetchCategories = async (
  params: PublicFetchCategoriesParams,
) => {
  try {
    const categories = await prisma.locationCategory.findMany({
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
        categories,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar categorias de praças! ",
      } as APIResponseInfo,
      data: {
        categories: [],
      },
    };
  }
};
