"use server";

import { DisplayQuestion } from "@/app/admin/forms/[formId]/edit/client";
import { prisma } from "@/lib/prisma";
import { Option } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

interface QuestionSearchedByStatement {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };

  subcategory: {
    id: number;
    name: string;
    categoryId: number;
  } | null;
}

const deleteQuestion = async (
  prevState: {
    statusCode: number;
    content: {
      formsWithQuestion: {
        id: number;
        name: string;
        version: number;
      }[];
      questionName: string | null;
    } | null;
  } | null,
  formData: FormData,
): Promise<{
  statusCode: number;
  content: {
    formsWithQuestion: { name: string; id: number; version: number }[];
    questionName: string | null;
  } | null;
}> => {
  const questionId = parseInt(formData.get("questionId") as string);
  try {
    const formsWithQuestion = await prisma.form.findMany({
      where: {
        questions: {
          some: {
            id: questionId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        version: true,
      },
    });
    if (formsWithQuestion.length > 0) {
      return {
        statusCode: 409,
        content: { formsWithQuestion: formsWithQuestion, questionName: null },
      };
    }
  } catch (e) {
    return { statusCode: 500, content: null };
  }
  try {
    const deletedQuestion = await prisma.question.delete({
      where: {
        id: questionId,
      },
    });
    revalidateTag("question");
    return {
      statusCode: 200,
      content: { formsWithQuestion: [], questionName: deletedQuestion.name },
    };
  } catch (err) {
    return { statusCode: 500, content: null };
  }
};

const searchQuestionsByFormId = async (formId: number) => {
  const questions = await prisma.question.findMany({
    where: {
      forms: {
        some: {
          id: formId,
        },
      },
    },
    select: {
      id: true,
      name: true,
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
  });
  return questions;
};

const searchQuestionsByStatement = async (statement: string) => {
  const cachedQuestions = unstable_cache(
    async (statement: string): Promise<DisplayQuestion[]> => {
      if (statement.length < 2) return [];

      let foundQuestions: DisplayQuestion[] = [];

      try {
        foundQuestions = await prisma.question.findMany({
          where: {
            name: {
              contains: statement,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
            name: true,
            characterType: true,
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
        });
      } catch (err) {
        // console.error(err);
      }

      return foundQuestions;
    },
    ["searchQuestionsByStatementCache"],
    { tags: ["question"] },
  );

  return await cachedQuestions(statement);
};

const searchQuestionsByCategoryAndSubcategory = async (
  categoryId: number | undefined,
  subcategoryId: number | undefined,
  verifySubcategoryNullness: boolean,
) => {
  const cachedQuestions = unstable_cache(
    async (
      categoryId: number | undefined,
      subcategoryId: number | undefined,
      verifySubcategoryNullness: boolean,
    ): Promise<DisplayQuestion[]> => {
      let foundQuestions: DisplayQuestion[] = [];
      if (!categoryId) return [];
      try {
        foundQuestions = await prisma.question.findMany({
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
            type: true,
            notes: true,
            characterType: true,
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
        });
      } catch (err) {
        // console.error(err);
      }

      return foundQuestions;
    },
    ["searchQuestionsByStatementCache"],
    { tags: ["question"] },
  );
  const questions = await cachedQuestions(
    categoryId,
    subcategoryId,
    verifySubcategoryNullness,
  );
  questions.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  return questions;
};

const searchOptionsByQuestionId = async (
  questionId: number,
): Promise<Option[]> => {
  try {
    const options = await prisma.option.findMany({
      where: {
        questionId: questionId,
      },
    });
    return options;
  } catch (err) {
    // console.error(`Erro ao buscar opções para a pergunta: ${questionId}`, err);
    return [];
  }
};

export {
  deleteQuestion,
  searchQuestionsByStatement,
  searchOptionsByQuestionId,
  searchQuestionsByCategoryAndSubcategory,
  searchQuestionsByFormId,
};

export { type QuestionSearchedByStatement };
