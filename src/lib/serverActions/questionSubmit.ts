"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const questionSchema = z.object({
  name: z.string(),
  optional: z.boolean().optional(),
  active: z.boolean().optional(),
  type: z.enum(["TEXT", "NUMERIC", "OPTIONS"]),
  categoryId: z.coerce.number(),
});

const textQuestionSchema = z.object({
  charLimit: z.coerce.number(),
});

const numericQuestionSchema = z
  .object({
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
  })
  .refine((value) => {
    if (value.min == undefined || value.max == undefined) return true;
    return value.min < value.max;
  });

const optionsQuestionSchema = z.object({
  optionType: z.enum(["SELECTION", "RADIO", "CHECKBOX"]),
  maximumSelections: z.coerce.number().optional(),
});

const optionSchema = z
  .object({
    text: z.string(),
  })
  .array()
  .nonempty();

const questionSubmit = async (prevState: { statusCode: number }, formData: FormData) => {
  const questionType = formData.get("questionType");

  let questionParsed;
  try {
    questionParsed = questionSchema.parse({
      name: formData.get("name"),
      type: questionType,
      categoryId: formData.get("categoryId"),
    });
  } catch (err) {
    console.log(err);
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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
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
        console.log(err);
        return { statusCode: 2 };
      }

      break;
    }
    case "OPTIONS": {
      const optionType = formData.get("optionType");

      let optionsQuestionObject;
      if (optionType == "CHECKBOX") {
        optionsQuestionObject = {
          optionType: optionType,
          maximumSelections: formData.get("maximumSelection"),
        };
      } else {
        optionsQuestionObject = {
          optionType: optionType,
        };
      }

      let optionsQuestionParsed;
      try {
        optionsQuestionParsed = optionsQuestionSchema.parse(optionsQuestionObject);
      } catch (err) {
        console.log(err);
        return { statusCode: 1 };
      }

      const options = formData.getAll("options").map((value) => ({ text: value }));
      let optionsParsed;
      try {
        optionsParsed = optionSchema.parse(options);
      } catch (err) {
        console.log(err);
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
        console.log(err);
        return { statusCode: 2 };
      }

      break;
    }
  }

  revalidateTag("question");
  return { statusCode: 0 };
};

export { questionSubmit };
