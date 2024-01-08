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
  try {
    await prisma.location.create({
      data: content,
    });
  } catch (error) {
    console.log(error);
  }
};

export { createLocation, fetchLocation };
