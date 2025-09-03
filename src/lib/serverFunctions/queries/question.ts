import { FormQuestion } from "@customTypes/forms/formCreation";
import { prisma } from "@lib/prisma";

const searchQuestionsByCategoryAndSubcategory = async (
  categoryId: number | undefined,
  subcategoryId: number | undefined,
  verifySubcategoryNullness: boolean,
): Promise<{ statusCode: number; questions: FormQuestion[] }> => {
  if (!categoryId) return { statusCode: 400, questions: [] };
  try {
    const questions = await prisma.question.findMany({
      where: {
        categoryId,
        ...(verifySubcategoryNullness && !subcategoryId ?
          {
            subcategoryId: null,
          }
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
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            categoryId: true,
          },
        },
      },
      orderBy: {
        name: "desc",
      },
    });

    questions.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    return { statusCode: 200, questions: questions };
  } catch (e) {
    return { statusCode: 500, questions: [] };
  }
};

export { searchQuestionsByCategoryAndSubcategory };
