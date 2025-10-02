import { prisma } from "@lib/prisma";

import { CategoryForQuestionPicker } from "../../types/forms/formCreation";

const searchQuestionsByCategoryAndSubcategory = async (
  categoryId: number | undefined,
  subcategoryId: number | undefined,
  verifySubcategoryNullness: boolean,
): Promise<{ statusCode: number; categories: CategoryForQuestionPicker[] }> => {
  if (!categoryId) return { statusCode: 400, categories: [] };
  try {
    const categories = await prisma.category.findMany({
      where: {
        id: categoryId,
      },
      orderBy: { name: "desc" },
      select: {
        id: true,
        name: true,
        notes: true,
        question: {
          where: {
            subcategoryId: null,
            ...(verifySubcategoryNullness && !subcategoryId ? {}
            : !subcategoryId ? {}
            : { subcategoryId }),
          },
          select: {
            id: true,
            name: true,
            questionType: true,
            notes: true,
            characterType: true,
            optionType: true,
            options: true,
            geometryTypes: true,
          },
          orderBy: { name: "desc" },
        },
        subcategory: {
          orderBy: { name: "desc" },
          select: {
            id: true,
            name: true,
            notes: true,
            question: {
              where: {
                ...(verifySubcategoryNullness && !subcategoryId ? {}
                : !subcategoryId ? {}
                : { subcategoryId }),
              },
              select: {
                id: true,
                name: true,
                questionType: true,
                notes: true,
                characterType: true,
                optionType: true,
                options: true,
                geometryTypes: true,
              },
              orderBy: { name: "desc" },
            },
          },
        },
      },
    });

    return { statusCode: 200, categories: categories };
  } catch (e) {
    return { statusCode: 500, categories: [] };
  }
};

export { searchQuestionsByCategoryAndSubcategory };
