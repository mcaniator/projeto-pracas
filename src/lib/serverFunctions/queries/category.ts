import { prisma } from "@lib/prisma";

type CategoriesWithQuestionsAndStatusCode = NonNullable<
  Awaited<ReturnType<typeof getCategories>>
>;

type CategoriesWithQuestions = NonNullable<
  Awaited<ReturnType<typeof getCategories>>["categories"]
>;

type CategoriesForFieldsCreation = NonNullable<
  Awaited<ReturnType<typeof fetchCategoriesForFieldsCreation>>
>;

const getCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        subcategory: {
          select: {
            id: true,
            name: true,
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

export { getCategories, fetchCategoriesForFieldsCreation };
export {
  type CategoriesWithQuestions,
  type CategoriesWithQuestionsAndStatusCode,
  type CategoriesForFieldsCreation,
};
