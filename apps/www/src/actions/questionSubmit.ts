"use server";

import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const formsField = z.object({
  category_id: z.coerce.number().int(),
  name: z.string().trim().min(1),
  optional: z.boolean(),
  active: z.boolean(),
});

const textField = z.object({
  char_limit: z.number().int(),
  id_field: z.number().int(),
});

const numericField = z
  .object({
    min: z.number().int(),
    max: z.number().int(),
    id_field: z.number().int(),
  })
  .refine((value) => value.min < value.max);

const optionField = z
  .object({
    option_limit: z.number().int(),
    total_options: z.number().int(),
    visual_preference: z
      .number()
      .int()
      .refine((value) => value >= 0 && value <= 2),
    id_field: z.number().int(),
  })
  .refine((value) => value.option_limit <= value.total_options);

const options = z
  .object({
    name: z.string().min(1),
    option_id: z.number().int(),
  })
  .array()
  .nonempty();

const questionSubmit = async (_prevState: any, formData: FormData) => {
  const prisma = new PrismaClient();

  const inputType = formData.get("inputType");
  if (inputType == null || inputType instanceof File) return;

  const form = formsField.parse({
    category_id: formData.get("categoryID"),
    name: formData.get("name"),
    optional: false,
    active: true,
  });

  const formResponse = await prisma.forms_fields.create({ data: form });

  switch (parseInt(inputType)) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      break;
  }

  // const options = formData.getAll("options").map((value) => {
  //   return { name: value };
  // });
  // const visualPreference = formData.get("visualPreference");
  //
  // let optionLimit: number | null | FormDataEntryValue = 0;
  //
  // if (visualPreference != undefined) {
  //   if (visualPreference == "2") {
  //     optionLimit = formData.get("optionLimit");
  //   } else {
  //     optionLimit = options.length;
  //   }
  // }
  //
  // if (optionLimit != null) {
  //   optionLimit = parseInt(optionLimit as string) > options.length ? options.length : optionLimit;
  // }
  //
  // const questionField =
  //   formData.get("inputType") == "text"
  //     ? {
  //         options: null,
  //         field: {
  //           char_limit: formData.get("charLimit"),
  //         },
  //       }
  //     : formData.get("inputType") == "numeric"
  //     ? {
  //         options: null,
  //         field: {
  //           id_field: -1,
  //           min: formData.get("min"),
  //           max: formData.get("max"),
  //         },
  //       }
  //     : {
  //         options: options,
  //         field: {
  //           option_limit: optionLimit,
  //           total_options: options.length,
  //           visual_preference: formData.get("visualPreference"),
  //         },
  //       };
  //
  // let parse;
  // try {
  //   parse = questionSchema.parse({
  //     type: formData.get("inputType"),
  //     question: {
  //       name: formData.get("name"),
  //       category_id: formData.get("select"),
  //       active: true,
  //       optional: false,
  //     },
  //     ...questionField,
  //   });
  // } catch (e) {
  //   return { message: "erro de tipagem" };
  // }
  //
  // try {
  //   await fetch("http://localhost:3333/form_field", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(parse),
  //   });
  // } catch (e) {
  //   return {
  //     message: "erro do servidor",
  //   };
  // }
  //
  // revalidatePath("/admin/registration");
  // return {
  //   message: "nenhum erro",
  // };
};

export { questionSubmit };
