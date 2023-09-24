"use server";

import { z } from "zod";

const categorySchema = z.object({
  category: z
    .object({
      name: z.string(),
      optional: z.boolean(),
      active: z.boolean(),
    })
    .array(),
});

const categorySubmit = async (formData: FormData) => {
  const parse = categorySchema.parse({
    category: [
      {
        name: formData.get("name"),
        optional: false,
        active: true,
      },
    ],
  });

  fetch("http://localhost:3333/category", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parse),
  });
};

const questionSchema = z.object({
  type: z.string(),
  question: z.object({
    name: z.string(),
    category_id: z.coerce.number(),
    active: z.boolean(),
    optional: z.boolean(),
  }),
  options: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .nullable(),
  field: z.union([
    z.object({
      char_limit: z.coerce.number(),
    }),
    z
      .object({
        id_field: z.coerce.number(),
        min: z.coerce.number(),
        max: z.coerce.number(),
      })
      .refine(
        (schema) => schema.max > schema.min,
        () => ({ message: "Min is bigger than max" }),
      ),
    z
      .object({
        option_limit: z.coerce.number(),
        total_options: z.coerce.number(),
        visual_preference: z.coerce.number(),
      })
      .refine((schema) => schema.option_limit <= schema.total_options),
  ]),
});

const questionSubmit = async (formData: FormData) => {
  const options = formData.getAll("options").map((value) => {
    return { name: value };
  });
  const visualPreference = formData.get("visualPreference");

  let optionLimit: number | null | FormDataEntryValue = 0;

  if (visualPreference != undefined) {
    if (visualPreference == "2") {
      optionLimit = formData.get("optionLimit");
    } else {
      optionLimit = options.length;
    }
  }

  if (optionLimit != null) {
    optionLimit =
      parseInt(optionLimit as string) > options.length
        ? options.length
        : optionLimit;
  }

  const questionField =
    formData.get("inputType") == "text"
      ? {
          options: null,
          field: {
            char_limit: formData.get("charLimit"),
          },
        }
      : formData.get("inputType") == "numeric"
      ? {
          options: null,
          field: {
            id_field: -1,
            min: formData.get("min"),
            max: formData.get("max"),
          },
        }
      : {
          options: options,
          field: {
            option_limit: optionLimit,
            total_options: options.length,
            visual_preference: formData.get("visualPreference"),
          },
        };

  const parse = questionSchema.parse({
    type: formData.get("inputType"),
    question: {
      name: formData.get("name"),
      category_id: formData.get("select"),
      active: true,
      optional: false,
    },
    ...questionField,
  });

  fetch("http://localhost:3333/form_field", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parse),
  });
};

export { categorySubmit, questionSubmit };
