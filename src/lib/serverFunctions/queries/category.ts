import { prisma } from "@lib/prisma";

type CategoriesWithQuestionsAndStatusCode = NonNullable<
  Awaited<ReturnType<typeof getCategories>>
>;

type CategoriesWithQuestions = NonNullable<
  Awaited<ReturnType<typeof getCategories>>["categories"]
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

export { getCategories };
export {
  type CategoriesWithQuestions,
  type CategoriesWithQuestionsAndStatusCode,
};
