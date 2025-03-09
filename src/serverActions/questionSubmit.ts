"use server";

import { prisma } from "@/lib/prisma";
import { optionSchema, questionSchema } from "@/lib/zodValidators";
import { Question } from "@prisma/client";
import { revalidateTag } from "next/cache";

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

export { questionSubmit };

export { type QuestionWithCategories };
