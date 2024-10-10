"use server";

import { prisma } from "@/lib/prisma";
import { optionSchema, questionSchema } from "@/lib/zodValidators";
import { Question } from "@prisma/client";
import { revalidateTag } from "next/cache";

interface QuestionWithCategories extends Question {
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
  prevState: { statusCode: number },
  formData: FormData,
) => {
  const questionType = formData.get("questionType");
  const questionCharacterType = formData.get("characterType");

  switch (questionType) {
    case "WRITTEN": {
      let writtenQuestionParsed;

      try {
        if (questionCharacterType === "TEXT") {
          writtenQuestionParsed = questionSchema.parse({
            name: formData.get("name"),
            type: questionType,
            characterType: questionCharacterType,
            categoryId: formData.get("categoryId"),
            responseCharLimit: formData.get("charLimit"),
            subcategoryId:
              Number(formData.get("subcategoryId")) > 0 ?
                formData.get("subcategoryId")
              : undefined,
            hasAssociatedGeometry:
              formData.get("hasAssociatedGeometry") === "true",
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
            type: questionType,
            characterType: questionCharacterType,
            categoryId: formData.get("categoryId"),
            subcategoryId:
              Number(formData.get("subcategoryId")) > 0 ?
                formData.get("subcategoryId")
              : undefined,
            minValue: formData.get("minValue"),
            maxValue: formData.get("maxValue"),
            hasAssociatedGeometry:
              formData.get("hasAssociatedGeometry") === "true",
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
        return { statusCode: 1 };
      }

      try {
        await prisma.question.create({
          data: {
            name: writtenQuestionParsed.name,
            type: writtenQuestionParsed.type,
            characterType: writtenQuestionParsed.characterType,
            categoryId: writtenQuestionParsed.categoryId,
            subcategoryId: writtenQuestionParsed.subcategoryId,
            responseCharLimit: writtenQuestionParsed.responseCharLimit,
            minValue: writtenQuestionParsed.minValue,
            maxValue: writtenQuestionParsed.maxValue,
            hasAssociatedGeometry: writtenQuestionParsed.hasAssociatedGeometry,
            geometryTypes: writtenQuestionParsed.geometryTypes,
          },
        });
      } catch (err) {
        return { statusCode: 2 };
      }

      break;
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
          type: questionType,
          characterType: questionCharacterType,
          categoryId,
          subcategoryId,
          hasAssociatedGeometry:
            formData.get("hasAssociatedGeometry") === "true",
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
        return { statusCode: 1 };
      }
      if (
        optionsQuestionParsed.optionType === "CHECKBOX" &&
        optionsQuestionParsed.maximumSelections === undefined
        //  &&
        // optionsQuestionParsed.maximumSelections > options.length
      ) {
        return { statusCode: 3 };
      }
      try {
        const newQuestion = await prisma.question.create({
          data: {
            name: optionsQuestionParsed.name,
            type: questionType,
            characterType: optionsQuestionParsed.characterType,
            categoryId: optionsQuestionParsed.categoryId,
            subcategoryId: optionsQuestionParsed.subcategoryId,
            optionType: optionsQuestionParsed.optionType,
            maximumSelections: optionsQuestionParsed.maximumSelections,
            hasAssociatedGeometry: optionsQuestionParsed.hasAssociatedGeometry,
            geometryTypes: optionsQuestionParsed.geometryTypes,
          },
        });
        const options = formData.getAll("options").map((value) => ({
          text: value,
          questionId: newQuestion.id,
        }));

        let optionsParsed;
        try {
          optionsParsed = optionSchema.parse(options);
        } catch (err) {
          return { statusCode: 1 };
        }

        try {
          await prisma.option.createMany({
            data: optionsParsed,
          });
        } catch (err) {
          return { statusCode: 2 };
        }
      } catch (err) {
        return { statusCode: 2 };
      }

      break;
    }
  }

  revalidateTag("question");
  return { statusCode: 0 };
};

export { questionSubmit };

export { type QuestionWithCategories };
