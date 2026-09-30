import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { FormUse } from "@prisma/client";
import { z } from "zod";

export type FetchCategoriesWithSubcategoriesReponse = NonNullable<
  Awaited<ReturnType<typeof getCategoriesWithSubcategories>>
>["data"];

export const getCategoriesWithSubcategoriesParamsSchema = z.object({
  formUse: z.nativeEnum(FormUse),
});

export type GetCategoriesWithSubcategoriesParams = z.infer<
  typeof getCategoriesWithSubcategoriesParamsSchema
>;

const getCategoriesWithSubcategories = async (
  request: APIRequestParams<GetCategoriesWithSubcategoriesParams>,
) => {
  const { formUse } = request.params!;
  try {
    const categories = await prisma.category.findMany({
      where: {
        formUse,
      },
      select: {
        id: true,
        name: true,
        notes: true,
        subcategory: {
          where: {
            formUse,
          },
          select: {
            id: true,
            name: true,
            notes: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        categories: categories,
      },
    };
  } catch (e) {
    return {
      responseInfo: { statusCode: 500 } as APIResponseInfo,
      data: {
        categories: [],
      },
    };
  }
};

export { getCategoriesWithSubcategories };
