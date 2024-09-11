"use server";

import { prisma } from "@/lib/prisma";
import { Option } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

interface QuestionSearchedByStatement {
  id: number;
  name: string;
  category:
    | {
        id: number;
        name: string;
      }
    | null
    | undefined;
  subcategory:
    | {
        id: number;
        name: string;
        categoryId: number;
      }
    | null
    | undefined;
}

const handleDelete = async (questionId: number) => {
  try {
    await prisma.question.delete({
      where: {
        id: questionId,
      },
    });
    revalidateTag("question");
  } catch (err) {
    // console.error(`Erro ao excluir o local: ${parkID}`, err);
  }
};

const searchQuestionsByStatement = async (statement: string) => {
  const cachedQuestions = unstable_cache(
    async (statement: string): Promise<QuestionSearchedByStatement[]> => {
      if (statement.length < 2) return [];

      let foundQuestions: QuestionSearchedByStatement[] = [];

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
) => {
  const cachedQuestions = unstable_cache(
    async (
      categoryId: number | undefined,
      subcategoryId: number | undefined,
    ): Promise<{ id: number; name: string }[]> => {
      let foundQuestions: { id: number; name: string }[] = [];
      if (!categoryId) return [];
      try {
        foundQuestions = await prisma.question.findMany({
          where: {
            categoryId,
            subcategoryId: subcategoryId ? subcategoryId : null,
          },
          select: {
            id: true,
            name: true,
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
  const questions = await cachedQuestions(categoryId, subcategoryId);
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
  handleDelete,
  searchQuestionsByStatement,
  searchOptionsByQuestionId,
  searchQuestionsByCategoryAndSubcategory,
};

export { type QuestionSearchedByStatement };
