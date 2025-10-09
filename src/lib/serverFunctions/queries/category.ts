import { prisma } from "@lib/prisma";

type CategoriesWithQuestionsAndStatusCode = NonNullable<
  Awaited<ReturnType<typeof getCategoriesWithSubcategories>>
>;

type CategoriesWithQuestions = NonNullable<
  Awaited<ReturnType<typeof getCategoriesWithSubcategories>>["categories"]
>;

type CategoriesForFieldsCreation = NonNullable<
  Awaited<ReturnType<typeof fetchCategoriesForFieldsCreation>>
>;

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
    return { statusCode: 200, categories: categories };
  } catch (e) {
    return { statusCode: 500, categories: [] };
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
export {
  type CategoriesWithQuestions,
  type CategoriesWithQuestionsAndStatusCode,
  type CategoriesForFieldsCreation,
};
