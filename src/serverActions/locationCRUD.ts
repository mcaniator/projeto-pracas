"use server";

import { prisma } from "@/lib/prisma";
import { locationType } from "@/lib/zodValidators";
import { locationDataToCreateType } from "@/lib/zodValidators";
import { Location } from "@prisma/client";
import { z } from "zod";

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
      if (
        key == "name" ||
        key == "notes" ||
        key == "overseeingMayor" ||
        key == "legislation"
      ) {
        dataToCreate[key] = z.string().trim().min(1).max(255).parse(value);
      } else if (key == "isPark" || key == "inactiveNotFound") {
        dataToCreate[key] = z.boolean().parse(value);
      } else if (
        key == "usableArea" ||
        key == "legalArea" ||
        key == "incline" ||
        key == "polygonArea"
      ) {
        dataToCreate[key] = z.coerce
          .number()
          .finite()
          .nonnegative()
          .parse(value);
      } else if (key == "creationYear") {
        dataToCreate[key] = z.coerce.date().parse(value);
      }
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
    return { statusCode: 2, errorMessage: "Error creating new location" };
  }
};

export { createLocation, fetchLocation };
