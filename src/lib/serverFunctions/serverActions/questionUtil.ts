"use server";

import { prisma } from "@/lib/prisma";
import {
  optionSchema,
  questionEditDataSchema,
  questionSchema,
} from "@/lib/zodValidators";
import { FormQuestion } from "@customTypes/forms/formCreation";
import { Question } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidateTag, unstable_cache } from "next/cache";
import { ZodError, z } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

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

interface QuestionWithCategories extends Question {
  options: {
    text: string;
  }[];
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

const _questionSubmit = async (
  prevState: { statusCode: number; questionName: string | null } | null,
  formData: FormData,
): Promise<{ statusCode: number; questionName: string | null } | null> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return { statusCode: 401, questionName: null };
  }
  const questionType = formData.get("questionType");
  const questionCharacterType = formData.get("characterType");
  const notes = formData.get("notes") as string;
  console.log("FORM DATA", formData);
  switch (questionType) {
    case "WRITTEN": {
      let writtenQuestionParsed;

      try {
        if (questionCharacterType === "TEXT") {
          writtenQuestionParsed = questionSchema.parse({
            name: formData.get("name"),
            notes: notes.length > 0 ? notes : null,
            questionType: questionType,
            characterType: questionCharacterType,
            categoryId: formData.get("categoryId"),
            subcategoryId:
              Number(formData.get("subcategoryId")) > 0 ?
                formData.get("subcategoryId")
              : undefined,
            geometryTypes:
              (
                formData.getAll("geometryTypes").length > 0 &&
                formData.get("hasAssociatedGeometry") === "true"
              ) ?
                formData.getAll("geometryTypes")
              : undefined,
          });
        } else {
          writtenQuestionParsed = questionSchema.parse({
            name: formData.get("name"),
            notes: notes.length > 0 ? notes : null,
            questionType: questionType,
            characterType: questionCharacterType,
            categoryId: formData.get("categoryId"),
            subcategoryId:
              Number(formData.get("subcategoryId")) > 0 ?
                formData.get("subcategoryId")
              : undefined,
            geometryTypes:
              (
                formData.getAll("geometryTypes").length > 0 &&
                formData.get("hasAssociatedGeometry") === "true"
              ) ?
                formData.getAll("geometryTypes")
              : undefined,
          });
        }
      } catch (err) {
        console.log(err);
        return { statusCode: 400, questionName: null };
      }

      try {
        const newQuestion = await prisma.question.create({
          data: writtenQuestionParsed,
        });
        revalidateTag("question");
        return { statusCode: 201, questionName: newQuestion.name };
      } catch (err) {
        console.log(err);
        return { statusCode: 400, questionName: null };
      }
    }

    case "OPTIONS": {
      const optionType = formData.get("optionType");
      const name = formData.get("name");
      const categoryId = formData.get("categoryId");
      const subcategoryId =
        Number(formData.get("subcategoryId")) > 0 ?
          formData.get("subcategoryId")
        : undefined;

      const optionsQuestionObject = { optionType };

      let optionsQuestionParsed;
      try {
        optionsQuestionParsed = questionSchema.parse({
          name,
          notes: notes.length > 0 ? notes : null,
          questionType: questionType,
          characterType: questionCharacterType,
          categoryId,
          subcategoryId,

          geometryTypes:
            (
              formData.getAll("geometryTypes").length > 0 &&
              formData.get("hasAssociatedGeometry") === "true"
            ) ?
              formData.getAll("geometryTypes")
            : undefined,
          ...optionsQuestionObject,
        });
      } catch (err) {
        return { statusCode: 400, questionName: null };
      }

      try {
        let questionName: string | null = null;
        await prisma.$transaction(async (prisma) => {
          const newQuestion = await prisma.question.create({
            data: {
              name: optionsQuestionParsed.name,
              notes: optionsQuestionParsed.notes,
              questionType: questionType,
              characterType: optionsQuestionParsed.characterType,
              categoryId: optionsQuestionParsed.categoryId,
              subcategoryId: optionsQuestionParsed.subcategoryId,
              optionType: optionsQuestionParsed.optionType,
              geometryTypes: optionsQuestionParsed.geometryTypes,
            },
          });

          const options = formData.getAll("options").map((value) => ({
            text: value,
            questionId: newQuestion.id,
          }));

          const optionsParsed = optionSchema.parse(options);
          await prisma.option.createMany({
            data: optionsParsed,
          });
          questionName = newQuestion.name;
        });

        revalidateTag("question");
        return { statusCode: 201, questionName: questionName };
      } catch (err) {
        console.log(err);
        return { statusCode: 400, questionName: null };
      }
    }
  }

  return { statusCode: 400, questionName: null };
};

const _questionUpdate = async (
  prevState: { responseInfo: { statusCode: number } },
  formData: FormData,
): Promise<{ responseInfo: APIResponseInfo }> => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Sem permissão para editar questões!",
      },
    };
  }

  try {
    const parse = questionEditDataSchema.parse({
      questionId: formData.get("questionId"),
      questionName: formData.get("questionName"),
      notes: formData.get("notes"),
    });
    const question = await prisma.question.update({
      where: {
        id: parse.questionId,
      },
      data: {
        name: parse.questionName,
        notes: parse.notes,
      },
      select: {
        name: true,
      },
    });
    revalidateTag("question");
    return {
      responseInfo: {
        statusCode: 200,
        message: `Questão \"${question.name}\" editada!`,
        showSuccessCard: true,
      },
    };
  } catch (e) {
    if (e instanceof ZodError) {
      return { responseInfo: { statusCode: 400, message: "Dados inválidos!" } };
    }
    return {
      responseInfo: { statusCode: 500, message: "Erro ao editar questão!" },
    };
  }
};

const _deleteQuestion = async (
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
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (e) {
    return {
      statusCode: 401,
      content: { formsWithQuestion: [], questionName: null },
    };
  }
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

const _searchQuestionsByStatement = async (statement: string) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
  } catch (e) {
    return { statusCode: 401, questions: [] };
  }
  const cachedQuestions = unstable_cache(
    async (statement: string): Promise<FormQuestion[]> => {
      if (statement.length < 2) return [];

      let foundQuestions: FormQuestion[] = [];

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
            notes: true,
            questionType: true,
            options: true,
            optionType: true,
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
        throw new Error("Error fetching questions");
      }

      return foundQuestions;
    },
    ["searchQuestionsByStatementCache"],
    { tags: ["question"] },
  );
  try {
    const questions = await cachedQuestions(statement);
    return { statusCode: 200, questions: questions };
  } catch (e) {
    return { statusCode: 500, questions: [] };
  }
};

export {
  _questionSubmit,
  _deleteQuestion,
  _questionUpdate,
  _searchQuestionsByStatement,
};

export type { QuestionSearchedByStatement, QuestionWithCategories };
