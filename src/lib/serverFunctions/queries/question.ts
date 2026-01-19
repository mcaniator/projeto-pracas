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
            : { id: -1 }),
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
              where:
                verifySubcategoryNullness && !subcategoryId ? { id: -1 }
                : !subcategoryId ? {}
                : { subcategoryId },
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

    const nonEmptyCategories = categories.filter(
      (cat) =>
        cat.subcategory.some((sub) => sub.question.length > 0) ||
        cat.question.length > 0,
    );

    return { statusCode: 200, categories: nonEmptyCategories };
  } catch (e) {
    return { statusCode: 500, categories: [] };
  }
};

const searchQuestionsByName = async (
  name: string,
): Promise<{ statusCode: number; categories: CategoryForQuestionPicker[] }> => {
  if (!name) return { statusCode: 400, categories: [] };

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "desc" },
      select: {
        id: true,
        name: true,
        notes: true,
        question: {
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            subcategoryId: null,
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
                name: {
                  contains: name,
                  mode: "insensitive",
                },
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

    const nonEmptyCategories = categories.filter(
      (cat) =>
        cat.subcategory.some((sub) => sub.question.length > 0) ||
        cat.question.length > 0,
    );

    return { statusCode: 200, categories: nonEmptyCategories };
  } catch (e) {
    return { statusCode: 500, categories: [] };
  }
};

export { searchQuestionsByCategoryAndSubcategory, searchQuestionsByName };
