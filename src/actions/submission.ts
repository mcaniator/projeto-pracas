"use server";

import { localsResponse } from "@/app/types";
import { revalidateTag } from "next/cache";
import { z } from "zod";

/* IMPORTANT: atualmente não é o servidor que fornece o id do polígono, sendo calculado
 * no cliente através das informações recebidas dos outros ids de praça, isso é um
 * péssimo jeito de fazer isso já que caso de dois requests serem processados ao mesmo
 * tempo mais de um item terá o mesmo ID.
 * URGENTEMENTE mudar isso */
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

export { mapSubmission, mapEdit };
