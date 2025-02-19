"use server";

import { prisma } from "@/lib/prisma";

type LocationTypes = Awaited<ReturnType<typeof fetchLocationTypes>>;

const createLocationType = async (locationId: number, typeName: string) => {
  try {
    await prisma.locationType.upsert({
      where: {
        name: typeName,
      },
      update: {
        locations: {
          connect: { id: locationId },
        },
      },
      create: {
        name: typeName,
        locations: {
          connect: { id: locationId },
        },
      },
    });
    return { statusCode: 201, message: "Location category created!" };
  } catch (e) {
    return { statusCode: 500, message: "Error during category creation" };
  }
};

const fetchLocationTypes = async () => {
  const defaultReturnArray: {
    id: number;
    name: string;
  }[] = [];
  try {
    const locationTypes = await prisma.locationType.findMany();
    return {
      statusCode: 200,
      message: "Location types fetch successful",
      types: locationTypes,
    };
  } catch (e) {
    return {
      statusCode: 500,
      message: "Error during category fetch",
      types: defaultReturnArray,
    };
  }
};

export { createLocationType, fetchLocationTypes };
export { type LocationTypes };
