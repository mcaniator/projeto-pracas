"use server";

import { prisma } from "@/lib/prisma";
import {
  optionSchema,
  questionEditDataSchema,
  questionSchema,
} from "@/lib/zodValidators";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { revalidateTag } from "next/cache";
import { ZodError } from "zod";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

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

export { _questionSubmit, _questionUpdate };
