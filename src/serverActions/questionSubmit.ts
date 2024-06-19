"use server";

import { prisma } from "@/lib/prisma";
import { optionSchema, questionSchema } from "@/lib/zodValidators";
import { Question, QuestionsOnForms } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

const questionSubmit = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  const questionType = formData.get("questionType");

  switch (questionType) {
    case "TEXT": {
      let textQuestionParsed;
      try {
        textQuestionParsed = questionSchema.parse({
          name: formData.get("name"),
          type: questionType,
          categoryId: formData.get("categoryId"),
          responseCharLimit: formData.get("charLimit"),
        });
      } catch (err) {
        return { statusCode: 1 };
      }

      try {
        await prisma.question.create({
          data: {
            name: textQuestionParsed.name,
            type: textQuestionParsed.type,
            categoryId: textQuestionParsed.categoryId,
            responseCharLimit: textQuestionParsed.responseCharLimit,
          },
        });
      } catch (err) {
        return { statusCode: 2 };
      }

      break;
    }
    case "NUMERIC": {
      let numericQuestionParsed;
      try {
        numericQuestionParsed = questionSchema.parse({
          name: formData.get("name"),
          type: questionType,
          categoryId: formData.get("categoryId"),
          min: formData.get("min"),
          max: formData.get("max"),
        });
      } catch (err) {
        return { statusCode: 1 };
      }

      try {
        await prisma.question.create({
          data: {
            name: numericQuestionParsed.name,
            type: numericQuestionParsed.type,
            categoryId: numericQuestionParsed.categoryId,
            minValue: numericQuestionParsed.minValue,
            maxValue: numericQuestionParsed.maxValue,
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

      const optionsQuestionObject =
        optionType === "CHECKBOX" ?
          { optionType, maximumSelections }
        : { optionType };

      let optionsQuestionParsed;
      try {
        optionsQuestionParsed = questionSchema.parse({
          name,
          type: questionType,
          categoryId,
          ...optionsQuestionObject,
        });
      } catch (err) {
        return { statusCode: 1 };
      }

      if (
        optionsQuestionParsed.maximumSelections !== undefined
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
            categoryId: optionsQuestionParsed.categoryId,
            optionType: optionsQuestionParsed.optionType,
            maximumSelections: optionsQuestionParsed.maximumSelections,
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

const searchQuestionsByFormId = async (id: number) => {
  const cachedQuestions = unstable_cache(
    async (id: number): Promise<Question[]> => {
      let foundQuestionsOnForms: QuestionsOnForms[] = [];
      let foundQuestions: Question[] = [];

      try {
        foundQuestionsOnForms = await prisma.questionsOnForms.findMany({
          where: {
            formId: id,
          },
        });
      } catch (err) {
        // console.error(err);
      }

      try {
        const foundQuestionsIds = foundQuestionsOnForms.map(
          (questionOnForm) => questionOnForm.questionId,
        );

        foundQuestions = await prisma.question.findMany({
          where: {
            id: {
              in: foundQuestionsIds,
            },
          },
        });
      } catch (err) {
        // console.error(err);
      }

      return foundQuestions;
    },
    ["searchQuestionsByFormIdCache"],
    { tags: ["question", "questionOnForm", "form"] },
  );

  if ((await cachedQuestions(id)).length === 0) return null;
  else return await cachedQuestions(id);
};

export { questionSubmit, searchQuestionsByFormId };
