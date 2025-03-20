"use server";

import { prisma } from "@/lib/prisma";
import { optionSchema, questionSchema } from "@/lib/zodValidators";
import { Option, Question } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

import { DisplayQuestion } from "../app/admin/registration/forms/[formId]/edit/client";

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

const questionSubmit = async (
  prevState: { statusCode: number; questionName: string | null } | null,
  formData: FormData,
): Promise<{ statusCode: number; questionName: string | null } | null> => {
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
            minValue: formData.get("minValue"),
            maxValue: formData.get("maxValue"),
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
  questionSubmit,
  deleteQuestion,
  searchQuestionsByStatement,
  searchOptionsByQuestionId,
  searchQuestionsByCategoryAndSubcategory,
  searchQuestionsByFormId,
};

export type { QuestionSearchedByStatement, QuestionWithCategories };
