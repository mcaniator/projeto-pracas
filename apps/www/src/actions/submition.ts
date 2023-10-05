"use server";

import { localsResponse } from "@/app/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  category: z
    .object({
      name: z.string().nonempty(),
      optional: z.boolean(),
      active: z.boolean(),
    })
    .array(),
});

const categorySubmit = async (prevState: any, formData: FormData) => {
  let parse;
  try {
    parse = categorySchema.parse({
      category: [
        {
          name: formData.get("name"),
          optional: false,
          active: true,
        },
      ],
    });
  } catch (e) {
    return {
      message: "erro de tipagem",
    };
  }

  try {
    await fetch("http://localhost:3333/category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parse),
    });
  } catch (e) {
    return {
      message: "erro do servidor",
    };
  }

  revalidateTag("category");
  return {
    message: "nenhum erro",
  };
};

const questionSchema = z.object({
  type: z.enum(["text", "numeric", "option"]),
  question: z.object({
    name: z.string().nonempty(),
    category_id: z.coerce.number(),
    active: z.boolean(),
    optional: z.boolean(),
  }),
  options: z
    .array(
      z.object({
        name: z.string().nonempty(),
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

const questionSubmit = async (prevState: any, formData: FormData) => {
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

  let parse;
  try {
    parse = questionSchema.parse({
      type: formData.get("inputType"),
      question: {
        name: formData.get("name"),
        category_id: formData.get("select"),
        active: true,
        optional: false,
      },
      ...questionField,
    });
  } catch (e) {
    return { message: "erro de tipagem" };
  }

  try {
    await fetch("http://localhost:3333/form_field", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parse),
    });
  } catch (e) {
    return {
      message: "erro do servidor",
    };
  }

  revalidatePath("/admin/registration");
  return {
    message: "nenhum erro",
  };
};

/* IMPORTANT: atualmente não é o servidor que fornece o id do polígono, sendo calculado
 *  no cliente através das informações recebidas dos outros ids de praça, isso é um
 *  péssimo jeito de fazer isso já que caso dois requests sejam processados ao mesmo
 *  tempo mais de um item terá o mesmo ID.
 *  URGENTEMENTE mudar isso */
const mapPolygonSchema = z.object({
  comments: z.string().nonempty(),
  common_name: z.string().nonempty(),
  free_space_category: z.coerce.number(),
  id: z.coerce.number(),
  name: z.string().nonempty(),
  polygon: z.object({
    coordinates: z
      .number()
      .array()
      .array()
      .refine(
        (schema) => {
          let isCorrect = true;
          schema.forEach((num) => {
            if (num.length != 2) {
              isCorrect = false;
            }
          });
          return isCorrect;
        },
        () => ({ message: "number of coordinates is incorrect" }),
      ),
    type: z.string().nonempty(),
  }),
  type: z.coerce.number(),
});

const addressesSchema = z.object({
  addresses: z
    .object({
      city: z.string().nonempty(),
      locals_id: z.number(),
      neighborhood: z.string().nonempty(),
      number: z.number(),
      street: z.string().nonempty(),
      UF: z.string().nonempty(),
    })
    .array(),
});

const mapSubmition = async () => {
  const parkData: localsResponse[] = await fetch(
    "http://localhost:3333/locals",
    { cache: "no-store", next: { tags: ["locals"] } }, // REMEMBERME: Lembrar de remover no-store
  ).then((res) => res.json());

  const usedIDs: number[] = parkData.map((values) => values.id);

  const curID = (() => {
    let returnValue: number | undefined = undefined;
    let aux = 0;
    while (returnValue == undefined) {
      if (!usedIDs.includes(aux)) {
        returnValue = aux;
      }

      aux++;
    }
    return returnValue;
  })();

  const parsed = mapPolygonSchema.parse({
    comments: z.string().nonempty(),
    common_name: z.string().nonempty(),
    free_space_category: z.coerce.number(),
    id: z.coerce.number(),
    name: z.string().nonempty(),
    polygon: z.object({
      coordinates: z
        .number()
        .array()
        .array()
        .refine(
          (schema) => {
            let isCorrect = true;
            schema.forEach((num) => {
              if (num.length != 2) {
                isCorrect = false;
              }
            });
            return isCorrect;
          },
          () => ({ message: "number of coordinates is incorrect" }),
        ),
      type: z.string().nonempty(),
    }),
    type: z.coerce.number(),
  });
};

export { categorySubmit, questionSubmit, mapSubmition };
