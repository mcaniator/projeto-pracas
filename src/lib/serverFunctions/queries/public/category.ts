import { prisma } from "@/lib/prisma";
import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const publicFetchCategoriesParamsSchema = z.object({
  cityId: z.coerce.number(),
});

export type PublicFetchCategoriesParams = z.infer<
  typeof publicFetchCategoriesParamsSchema
>;

export type PublicFetchCategoriesResponse = Awaited<
  ReturnType<typeof publicFetchCategories>
>["data"];

export const publicFetchCategories = async (
  request: APIRequestParams<PublicFetchCategoriesParams>,
) => {
  const params = request.params!;
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
