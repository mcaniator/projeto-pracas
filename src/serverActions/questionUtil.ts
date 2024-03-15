"use server";

import { prisma } from "@/lib/prisma";
import { Question } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

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
    async (statement: string): Promise<Question[]> => {
      if (statement.length < 2) return [];

      let foundQuestions: Question[] = [];

      try {
        foundQuestions = await prisma.question.findMany({
          where: {
            name: {
              contains: statement,
              mode: "insensitive",
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

export { handleDelete, searchQuestionsByStatement };
