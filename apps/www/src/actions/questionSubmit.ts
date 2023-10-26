"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const formsFieldSchema = z.object({
  category_id: z.coerce.number().int(),
  name: z.string().trim().min(1),
  optional: z.boolean(),
  active: z.boolean(),
});

const textFieldSchema = z.object({
  char_limit: z.coerce
    .number()
    .int()
    .refine((value) => value > 0),
  id_field: z.number().int(),
});

const numericFieldSchema = z
  .object({
    min: z.coerce.number().int(),
    max: z.coerce.number().int(),
    id_field: z.number().int(),
  })
  .refine((value) => value.min < value.max);

const optionFieldSchema = z
  .object({
    option_limit: z.coerce.number().int(),
    total_options: z.number().int(),
    visual_preference: z.coerce
      .number()
      .int()
      .refine((value) => value >= 0 && value <= 2),
    id_field: z.number().int(),
  })
  .refine((value) => value.option_limit <= value.total_options);

const optionsSchema = z
  .object({
    name: z.string().min(1),
    id_optionfield: z.number().int(),
  })
  .array()
  .nonempty();

const questionSubmit = async (_prevState: any, formData: FormData) => {
  const prisma = new PrismaClient();

  const inputType = formData.get("inputType");
  if (inputType == null || inputType instanceof File) return;

  const formsField = formsFieldSchema.parse({
    category_id: formData.get("categoryID"),
    name: formData.get("name"),
    optional: false,
    active: true,
  });

  let formResponse;
  try {
    formResponse = await prisma.forms_fields.create({ data: formsField });
  } catch (e) {
    console.log("erro ao enviar a primeira parte para o servidor, revertendo mudanças! - ", e);
    await prisma.forms_fields.delete({ where: { id: formResponse?.id } });
    prisma.$disconnect();
    return;
  }

  switch (parseInt(inputType)) {
    case 0:
      let textResponse;
      try {
        const text = textFieldSchema.parse({
          char_limit: formData.get("charLimit"),
          id_field: formResponse.id,
        });

        textResponse = await prisma.textfield.create({ data: text });
      } catch (e) {
        console.log("erro ao enviar a segunda parte para o servidor (mais provável) ou erro de tipagem, revertendo mudanças! - ", e);
        try {
          await prisma.forms_fields.delete({ where: { id: formResponse.id } });
          if (textResponse?.id) {
            await prisma.textfield.delete({
              where: {
                id: textResponse.id,
              },
            });
          }
        } catch (e) {
          console.log("ou o valor não existe (mais provável) ou erro ao comunicar com a base de dados - ", e);
        }
      }
      break;

    case 1:
      let numberResponse;
      try {
        const number = numericFieldSchema.parse({
          min: formData.get("min"),
          max: formData.get("max"),
          id_field: formResponse.id,
        });

        numberResponse = await prisma.numericfield.create({ data: number });
      } catch (e) {
        console.log("erro ao enviar a segunda parte para o servidor (mais provável) ou erro de tipagem, revertendo mudanças! - ", e);
        try {
          await prisma.forms_fields.delete({ where: { id: formResponse.id } });
          if (numberResponse?.id) {
            await prisma.textfield.delete({
              where: {
                id: numberResponse.id,
              },
            });
          }
        } catch (e) {
          console.log("ou o valor não existe (mais provável) ou erro ao comunicar com a base de dados - ", e);
        }
      }
      break;

    case 2:
      const optionsName = formData.getAll("options").map((value) => {
        return { name: value };
      });
      const visualPreference = formData.get("visualPreference");

      const optionLimit = (() => {
        if (visualPreference == "2") return formData.get("optionLimit");
        else return optionsName.length;
      })();

      let optionFieldResponse: any;
      let optionsResponse;
      try {
        const optionField = optionFieldSchema.parse({
          id_field: formResponse.id,
          option_limit: optionLimit,
          total_options: optionsName.length,
          visual_preference: visualPreference,
        });

        optionFieldResponse = await prisma.optionfield.create({ data: optionField });

        const options = optionsSchema.parse(
          optionsName.map((value) => {
            return { ...value, id_optionfield: optionFieldResponse.id };
          }),
        );

        optionsResponse = await prisma.option.createMany({ data: options });
      } catch (e) {
        console.log("erro ao enviar a segunda parte para o servidor, revertendo mudanças! - ", e);
        await prisma.forms_fields.delete({ where: { id: formResponse.id } });
        if (optionFieldResponse.id) await prisma.textfield.delete({ where: { id: optionFieldResponse.id } });
        if (optionsResponse != undefined) await prisma.option.deleteMany({ where: { id_optionfield: optionFieldResponse.id } });
      }
      break;
  }

  prisma.$disconnect();
};

export { questionSubmit };
