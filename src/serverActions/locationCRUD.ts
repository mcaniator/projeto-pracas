"use server";

import { prisma } from "@/lib/prisma";
import { locationType } from "@/lib/zodValidators";
import { locationDataToCreateType } from "@/lib/zodValidators";
import { Location } from "@prisma/client";

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
  const dataToCreate: locationDataToCreateType = {};
  Object.entries(content).forEach(([key, value]) => {
    if (key == "narrowAdministrativeUnit") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_narrowUnitName: {
              cityId: cityID,
              name: value,
            },
          },
          create: {
            cityId: cityID,
            name: value,
          },
        },
      };
    } else if (key == "intermediateAdministrativeUnit") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_intermediateUnitName: {
              cityId: cityID,
              name: value,
            },
          },
          create: {
            cityId: cityID,
            name: value,
          },
        },
      };
    } else if (key == "broadAdministrativeUnit") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_broadUnitName: {
              cityId: cityID,
              name: value,
            },
          },
          create: {
            cityId: cityID,
            name: value,
          },
        },
      };
    } else {
      dataToCreate[key] = value;
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
