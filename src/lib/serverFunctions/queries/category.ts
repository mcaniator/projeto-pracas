import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";

type CategoriesForFieldsCreation = NonNullable<
  Awaited<ReturnType<typeof fetchCategoriesForFieldsCreation>>
>;

export type FetchCategoriesWithSubcategoriesReponse = NonNullable<
  Awaited<ReturnType<typeof getCategoriesWithSubcategories>>
>["data"];

const getCategoriesWithSubcategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        notes: true,
        subcategory: {
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

const fetchCategoriesForFieldsCreation = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategory: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { statusCode: 200, categories };
  } catch (e) {
    return { statusCode: 500, categories: null };
  }
};

export { getCategoriesWithSubcategories, fetchCategoriesForFieldsCreation };
export { type CategoriesForFieldsCreation };
