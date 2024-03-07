"use server";

import { prisma } from "@/lib/prisma";
import {
  numericQuestionSchema,
  optionSchema,
  optionsQuestionSchema,
  questionSchema,
  textQuestionSchema,
} from "@/lib/zodValidators";
import { revalidateTag } from "next/cache";

const questionSubmit = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  const questionType = formData.get("questionType");

  let questionParsed;
  try {
    questionParsed = questionSchema.parse({
      name: formData.get("name"),
      type: questionType,
      categoryId: formData.get("categoryId"),
    });
  } catch (err) {
    return { statusCode: 1 };
  }

  switch (questionType) {
    case "TEXT": {
      let textQuestionParsed;
      try {
        textQuestionParsed = textQuestionSchema.parse({
          charLimit: formData.get("charLimit"),
        });
      } catch (err) {
        return { statusCode: 1 };
      }

      try {
        await prisma.question.create({
          data: {
            ...questionParsed,
            TextQuestion: {
              create: textQuestionParsed,
            },
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
        numericQuestionParsed = numericQuestionSchema.parse({
          min: formData.get("min"),
          max: formData.get("max"),
        });
      } catch (err) {
        return { statusCode: 1 };
      }

      try {
        await prisma.question.create({
          data: {
            ...questionParsed,
            NumericQuestion: {
              create: numericQuestionParsed,
            },
          },
        });
      } catch (err) {
        return { statusCode: 2 };
      }

      break;
    }
    case "OPTIONS": {
      const optionType = formData.get("optionType");

      const optionsQuestionObject =
        optionType == "CHECKBOX" ?
          {
            optionType: optionType,
            maximumSelections: formData.get("maximumSelection"),
          }
        : {
            optionType: optionType,
          };

      let optionsQuestionParsed;
      try {
        optionsQuestionParsed = optionsQuestionSchema.parse(
          optionsQuestionObject,
        );
      } catch (err) {
        return { statusCode: 1 };
      }

      const options = formData
        .getAll("options")
        .map((value) => ({ text: value }));

      try {
        if (
          optionsQuestionParsed.maximumSelections != undefined &&
          optionsQuestionParsed.maximumSelections > options.length
        )
          throw new Error(
            "Number of maximum selections is bigger than the amount of options",
          );
      } catch (err) {
        return { statusCode: 3 };
      }

      let optionsParsed;
      try {
        optionsParsed = optionSchema.parse(options);
      } catch (err) {
        return { statusCode: 1 };
      }

      try {
        await prisma.question.create({
          data: {
            ...questionParsed,
            OptionsQuestion: {
              create: {
                ...optionsQuestionParsed,
                options: {
                  createMany: {
                    data: optionsParsed,
                  },
                },
              },
            },
          },
        });
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
