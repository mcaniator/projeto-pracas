"use server";

import { localsResponse } from "@/app/types";
import { PrismaClient } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  optional: z.boolean(),
  active: z.boolean(),
});

const categorySubmit = async (prevState: any, formData: FormData) => {
  const prisma = new PrismaClient();

  let parse;
  try {
    parse = categorySchema.parse({
      name: formData.get("name"),
      optional: false,
      active: true,
    });
  } catch (e) {
    return {
      message: "erro de tipagem",
    };
  }

  try {
    const post = await prisma.category.create({ data: parse });
  } catch (e) {
    return {
      message: "erro do servidor",
    };
  }

  prisma.$disconnect();
  revalidatePath("/admin/registration/components");
  return {
    message: "nenhum erro",
  };
};

const questionSchema = z.object({
  type: z.enum(["text", "numeric", "option"]),
  question: z.object({
    name: z.string().min(1),
    category_id: z.coerce.number(),
    active: z.boolean(),
    optional: z.boolean(),
  }),
  options: z
    .array(
      z.object({
        name: z.string().min(1),
      }),
    )
    .refine((value) => {
      return value.length != 0;
    })
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
    optionLimit = parseInt(optionLimit as string) > options.length ? options.length : optionLimit;
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
  comments: z.string().min(1),
  common_name: z.string().min(1),
  free_space_category: z.coerce.number(),
  id: z.coerce.number(),
  name: z.string().min(1),
  polygon: z.object({
    coordinates: z.coerce
      .number()
      .array()
      .array()
      .array()
      .refine(
        (schema) => {
          let isCorrect = true;
          schema.forEach((num) => {
            num.forEach((nums) => {
              if (nums.length != 2) {
                isCorrect = false;
              }
            });
          });
          return isCorrect;
        },
        () => ({ message: "number of coordinates is incorrect" }),
      ),
    type: z.string().min(1),
  }),
  type: z.coerce.number(),
});

const addressesSchema = z.object({
  addresses: z
    .object({
      city: z.string().min(1),
      locals_id: z.number(),
      neighborhood: z.string().min(1),
      number: z.coerce.number(),
      street: z.string().min(1),
      UF: z.string().min(1),
    })
    .array(),
});

const mapSubmission = async (prevState: any, formData: FormData) => {
  console.log("post received");

  const parkData: localsResponse[] = await fetch("http://localhost:3333/locals", { next: { tags: ["locals"] } }).then((res) => res.json());

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

  const addressAmount = formData.get("addressAmount");
  const addresses = (() => {
    if (addressAmount == null || addressAmount instanceof File) return [];

    let buffer = null;
    let i = 0;
    while (i < parseInt(addressAmount)) {
      if (formData.get(`addresses[${i}][city]`) != null) {
        if (buffer != null) {
          buffer = [
            ...buffer,
            {
              city: formData.get(`addresses[${i}][city]`),
              locals_id: curID,
              neighborhood: formData.get(`addresses[${i}][neighborhood]`),
              number: formData.get(`addresses[${i}][number]`),
              street: formData.get(`addresses[${i}][street]`),
              UF: formData.get(`addresses[${i}][state]`),
            },
          ];
        } else {
          buffer = [
            {
              city: formData.get(`addresses[${i}][city]`),
              locals_id: curID,
              neighborhood: formData.get(`addresses[${i}][neighborhood]`),
              number: formData.get(`addresses[${i}][number]`),
              street: formData.get(`addresses[${i}][street]`),
              UF: formData.get(`addresses[${i}][state]`),
            },
          ];
        }
      }

      i++;
    }

    return buffer;
  })();

  const pointsAmount = formData.get("pointsAmount");
  const points = (() => {
    if (pointsAmount == null || pointsAmount instanceof File) return [];

    let buffer = null;
    let i = 0;
    while (i < parseInt(pointsAmount)) {
      if (buffer != null) {
        buffer = [...buffer, [formData.get(`points[${i}][lat]`), formData.get(`points[${i}][lng]`)]];
      } else {
        buffer = [[formData.get(`points[${i}][lat]`), formData.get(`points[${i}][lng]`)]];
      }

      i++;
    }

    return buffer;
  })();

  const parsedMap = mapPolygonSchema.parse({
    comments: formData.get("comments"),
    common_name: formData.get("commonName"),
    free_space_category: formData.get("parkCategories"),
    id: curID,
    name: formData.get("name"),
    polygon: {
      coordinates: [points],
      type: "Polygon",
    },
    type: formData.get("parkTypes"),
  });
  const parsedAddress = addressesSchema.parse({
    addresses: addresses,
  });

  console.log(parsedMap.polygon);

  try {
    await fetch("http://localhost:3333/locals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedMap),
    });

    await fetch("http://localhost:3333/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedAddress),
    });
  } catch (e) {}

  revalidateTag("locals");
};

const mapEdit = async (prevState: any, formData: FormData) => {
  console.log("o servidor recebeu o request mas não sabe o que fazer com ele por enquanto");
};

export { categorySubmit, questionSubmit, mapSubmission, mapEdit };
