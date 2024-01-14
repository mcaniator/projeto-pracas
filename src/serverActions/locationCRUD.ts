"use server";

import { prisma } from "@/lib/prisma";
import { locationType } from "@/lib/zodValidators";
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
    console.log(error);
  }

  return currentPark;
};

const createLocation = async (content: locationType, cityID: Number, polygonContent: string) => {
  const dataToCreate: any = {};
  Object.entries(content).forEach(([key, value]) => {
    if (key == "administrativeDelimitation1") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_administrativeDelimitation1Name: {
              cityId: cityID,
              administrativeDelimitation1Name: value,
            },
          },
          create: {
            cityId: cityID,
            administrativeDelimitation1Name: value,
          },
        },
      };
    } else if (key == "administrativeDelimitation2") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_administrativeDelimitation2Name: {
              cityId: cityID,
              administrativeDelimitation2Name: value,
            },
          },
          create: {
            cityId: cityID,
            administrativeDelimitation2Name: value,
          },
        },
      };
    } else if (key == "administrativeDelimitation3") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            cityId_administrativeDelimitation3Name: {
              cityId: cityID,
              administrativeDelimitation3Name: value,
            },
          },
          create: {
            cityId: cityID,
            administrativeDelimitation3Name: value,
          },
        },
      };
    } else {
      dataToCreate[key] = value;
    }
  });
  try {
    let locationCreated = await prisma.location.create({
      data: dataToCreate,
    });
    if (polygonContent != null) {
      polygonContent = "MULTIPOLYGON" + polygonContent;
      await prisma.$executeRaw`UPDATE location
    SET polygon = ST_GeomFromText(${polygonContent},4326)
    WHERE id = ${locationCreated.id}`;
    }
  } catch (error) {
    console.log(error);
  }
};

export { createLocation, fetchLocation };
