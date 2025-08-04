"use server";

import { prisma } from "@/lib/prisma";
import { optionSchema, questionSchema } from "@/lib/zodValidators";
import { FormQuestion } from "@customTypes/forms/formCreation";
import { Question } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
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
  switch (questionType) {
    case "WRITTEN": {
      let writtenQuestionParsed;

      try {
        if (questionCharacterType === "TEXT") {
          writtenQuestionParsed = questionSchema.parse({
            name: formData.get("name"),
            notes: notes.length > 0 ? notes : null,
            type: questionType,
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
            type: questionType,
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
        return { statusCode: 400, questionName: null };
      }

      try {
        const newQuestion = await prisma.question.create({
          data: writtenQuestionParsed,
        });
        revalidateTag("question");
        return { statusCode: 201, questionName: newQuestion.name };
      } catch (err) {
        return { statusCode: 400, questionName: null };
      }
    }

    case "OPTIONS": {
      const optionType = formData.get("optionType");
      const maximumSelections = formData.get("maximumSelection");
      const name = formData.get("name");
      const categoryId = formData.get("categoryId");
      const subcategoryId =
        Number(formData.get("subcategoryId")) > 0 ?
          formData.get("subcategoryId")
        : undefined;

      const optionsQuestionObject =
        optionType === "CHECKBOX" ?
          { optionType, maximumSelections }
        : { optionType };

      let optionsQuestionParsed;
      try {
        optionsQuestionParsed = questionSchema.parse({
          name,
          notes: notes.length > 0 ? notes : null,
          type: questionType,
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
      if (
        optionsQuestionParsed.optionType === "CHECKBOX" &&
        optionsQuestionParsed.maximumSelections === undefined
      ) {
        return { statusCode: 1, questionName: null };
      }
      try {
        let questionName: string | null = null;
        await prisma.$transaction(async (prisma) => {
          const newQuestion = await prisma.question.create({
            data: {
              name: optionsQuestionParsed.name,
              notes: optionsQuestionParsed.notes,
              type: questionType,
              characterType: optionsQuestionParsed.characterType,
              categoryId: optionsQuestionParsed.categoryId,
              subcategoryId: optionsQuestionParsed.subcategoryId,
              optionType: optionsQuestionParsed.optionType,
              maximumSelections: optionsQuestionParsed.maximumSelections,
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
        return { statusCode: 400, questionName: null };
      }
    }
  }

  return { statusCode: 400, questionName: null };
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
            type: true,
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

export { _questionSubmit, _deleteQuestion, _searchQuestionsByStatement };

export type { QuestionSearchedByStatement, QuestionWithCategories };
