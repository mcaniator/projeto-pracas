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

const createLocation = async (content: locationType) => {
  const dataToCreate: any = {};
  Object.entries(content).forEach(([key, value]) => {
    if (key == "administrativeDelimitation1") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            administrativeDelimitation1Name: value,
          },
          create: {
            administrativeDelimitation1Name: value,
          },
        },
      };
    } else if (key == "administrativeDelimitation2") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            administrativeDelimitation2Name: value,
          },
          create: {
            administrativeDelimitation2Name: value,
          },
        },
      };
    } else if (key == "administrativeDelimitation3") {
      dataToCreate[key] = {
        connectOrCreate: {
          where: {
            administrativeDelimitation3Name: value,
          },
          create: {
            administrativeDelimitation3Name: value,
          },
        },
      };
    } else {
      dataToCreate[key] = value;
    }
  });
  try {
    await prisma.location.create({
      data: dataToCreate,
    });
  } catch (error) {
    console.log(error);
  }
};

export { createLocation, fetchLocation };
