"use server";

import { prisma } from "@/lib/prisma";
import { locationType } from "@/lib/zodValidators";
import { locationDataToCreateType } from "@/lib/zodValidators";
import { Location } from "@prisma/client";
import { LocationTypes } from "@prisma/client";
import { CategoryTypes } from "@prisma/client";
import { z } from "zod";

//Definindo verificação de tipagem com ZOD
//const locationTypesEnum = z.nativeEnum(LocationTypes);
//const categoryTypesEnum = z.nativeEnum(CategoryTypes);
const nonAdministrativeUnitTypes = z.union([
  z.boolean().optional(),
  z.string().trim().min(1).max(255),
  z.string().trim().min(1).optional(),
  z.coerce.date().optional(),
  z.string().trim().min(1).max(255).optional(),
  z.coerce.number().finite().nonnegative().optional(),
  z.nativeEnum(LocationTypes).optional(),
  z.nativeEnum(CategoryTypes).optional(),

  z.object({
    connectOrCreate: z.object({
      where: z.object({
        cityId_narrowUnitName: z.object({
          name: z.string().trim().min(1).max(255),
          cityId: z.coerce.number().int().finite().nonnegative(),
        }),
      }),
      create: z.object({
        name: z.string().trim().min(1).max(255),
        cityId: z.coerce.number().int().finite().nonnegative(),
      }),
    }),
  }),

  z.object({
    connectOrCreate: z.object({
      where: z.object({
        cityId_intermediateUnitName: z.object({
          name: z.string().trim().min(1).max(255),
          cityId: z.coerce.number().int().finite().nonnegative(),
        }),
      }),
      create: z.object({
        name: z.string().trim().min(1).max(255),
        cityId: z.coerce.number().int().finite().nonnegative(),
      }),
    }),
  }),

  z.object({
    connectOrCreate: z.object({
      where: z.object({
        cityId_broadUnitName: z.object({
          name: z.string().trim().min(1).max(255),
          cityId: z.coerce.number().int().finite().nonnegative(),
        }),
      }),
      create: z.object({
        name: z.string().trim().min(1).max(255),
        cityId: z.coerce.number().int().finite().nonnegative(),
      }),
    }),
  }),
]);
//Fim de definições

const fetchLocation = async (id: number) => {
  let currentPark: Location | null = null;

  try {
    currentPark = await prisma.location.findUnique({
      where: {
        id: id,
      },
    });
  } catch (error) {
    return { statusCode: 1, errorMessage: "Error fetching location id" };
  }

  return currentPark;
};

const createLocation = async (
  content: locationType,
  cityID: number,
  polygonContent: string,
) => {
  const dataToCreate: locationDataToCreateType = { name: "" };
  Object.entries(content).forEach(([key, value]) => {
    if (key == "narrowAdministrativeUnit") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_narrowUnitName: {
              cityId: cityID,
              name: z.string().parse(value),
            },
          },
          create: {
            cityId: cityID,
            name: z.string().parse(value),
          },
        },
      };
    } else if (key == "intermediateAdministrativeUnit") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_intermediateUnitName: {
              cityId: cityID,
              name: z.string().parse(value),
            },
          },
          create: {
            cityId: cityID,
            name: z.string().parse(value),
          },
        },
      };
    } else if (key == "broadAdministrativeUnit") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_broadUnitName: {
              cityId: cityID,
              name: z.string().parse(value),
            },
          },
          create: {
            cityId: cityID,
            name: z.string().parse(value),
          },
        },
      };
    } else {
      dataToCreate[key] = nonAdministrativeUnitTypes.parse(value);
    }
  });
  try {
    const locationCreated = await prisma.location.create({
      data: dataToCreate,
    });
    if (polygonContent != null) {
      polygonContent = "MULTIPOLYGON" + polygonContent;
      await prisma.$executeRaw`UPDATE location
    SET polygon = ST_GeomFromText(${polygonContent},4326)
    WHERE id = ${locationCreated.id}`;
    }
  } catch (error) {
    //return { statusCode: 2, errorMessage: "Error creating new location" };
    console.log(error);
  }
};

export { createLocation, fetchLocation };
