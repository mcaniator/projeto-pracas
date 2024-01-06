"use server";

import { prisma } from "@/lib/prisma";
import { addressSchema, citySchema, locationSchema } from "@/lib/zodValidators";
import { z } from "zod";

const mapSubmission = async (prevState: { statusCode: number }, formData: FormData) => {
  const addressAmount = formData.get("addressAmount");
  const addresses = (() => {
    const aux: z.infer<typeof addressSchema>[] = [];

    if (addressAmount == null || addressAmount instanceof File) return aux;

    // cache so it doesn't have to recalculate for every for loop
    const addressAmountInt = parseInt(addressAmount);
    const getInfo = (fetchString: string) => {
      const buffer = formData.get(fetchString);

      if (buffer == null || buffer instanceof File) return "";
      else return buffer;
    };
    for (let i = 0; i < addressAmountInt; i++) {
      const neighborhood = getInfo(`addresses[${i}][neighborhood]`);
      const identifier = getInfo(`addresses[${i}][number]`);
      const postalCode = "";
      const street = "";
      const state = "MINAS_GERAIS";
      const locationId = 0;
      const cityId = 0;

      aux.push({
        locationId: locationId,
        cityId: cityId,
        neighborhood: neighborhood,
        identifier: parseInt(identifier),
        postalCode: postalCode,
        street: street,
        state: state,
      });
    }

    return aux;
  })();

  console.log(addresses);

  try {
    const parsedLocation = locationSchema.parse({ name: "cidade teste", type: "JARDIM", category: "DE_PRATICAS_SOCIAIS" });
    const parsedAddress = addressSchema.parse({
      neighborhood: "bairro teste",
      street: "rua de teste",
      postalCode: "00000000",
      identifier: 0,
      state: "MINAS_GERAIS",
    });
    const parsedCity = citySchema.parse({ name: "test" });

    const city = await prisma.city.upsert({
      where: parsedCity,
      update: {},
      create: parsedCity,
    });

    await prisma.location.create({
      data: {
        ...parsedLocation,
        address: {
          createMany: {
            data: [
              {
                ...parsedAddress,
                cityId: city.id,
              },
            ],
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }

  return { statusCode: 1 };
};

// const mapSubmission = async (prevState: { message: string }, formData: FormData) => {
//   const addressAmount = formData.get("addressAmount");
//   const addresses = (() => {
//     if (addressAmount == null || addressAmount instanceof File) return [];
//
//     let buffer = null;
//     let i = 0;
//     while (i < parseInt(addressAmount)) {
//       if (formData.get(`addresses[${i}][city]`) != null) {
//         if (buffer != null) {
//           buffer = [
//             ...buffer,
//             {
//               city: formData.get(`addresses[${i}][city]`),
//               locals_id: curID,
//               neighborhood: formData.get(`addresses[${i}][neighborhood]`),
//               number: formData.get(`addresses[${i}][number]`),
//               street: formData.get(`addresses[${i}][street]`),
//               UF: formData.get(`addresses[${i}][state]`),
//             },
//           ];
//         } else {
//           buffer = [
//             {
//               city: formData.get(`addresses[${i}][city]`),
//               locals_id: curID,
//               neighborhood: formData.get(`addresses[${i}][neighborhood]`),
//               number: formData.get(`addresses[${i}][number]`),
//               street: formData.get(`addresses[${i}][street]`),
//               UF: formData.get(`addresses[${i}][state]`),
//             },
//           ];
//         }
//       }
//
//       i++;
//     }
//
//     return buffer;
//   })();
//
//   const pointsAmount = formData.get("pointsAmount");
//   const points = (() => {
//     if (pointsAmount == null || pointsAmount instanceof File) return [];
//
//     let buffer = null;
//     let i = 0;
//     while (i < parseInt(pointsAmount)) {
//       if (buffer != null) {
//         buffer = [...buffer, [formData.get(`points[${i}][lat]`), formData.get(`points[${i}][lng]`)]];
//       } else {
//         buffer = [[formData.get(`points[${i}][lat]`), formData.get(`points[${i}][lng]`)]];
//       }
//
//       i++;
//     }
//
//     return buffer;
//   })();
//
//   return prevState;
// };

const mapEdit = (prevState: { message: string }, formData: FormData) => {
  console.log(`o servidor recebeu o request mas não sabe o que fazer com ele por enquanto ${prevState.message} ${typeof formData.get("temp")}`);
  return { message: "Not implemented" };
};

export { mapEdit, mapSubmission };
