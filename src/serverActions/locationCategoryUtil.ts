"use server";

import { prisma } from "@/lib/prisma";

type LocationCategories = Awaited<ReturnType<typeof fetchLocationCategories>>;

const upsertLocationCategory = async (
  locationId: number,
  categoryName: string,
) => {
  try {
    await prisma.locationCategory.upsert({
      where: {
        name: categoryName,
      },
      update: {
        locations: {
          connect: { id: locationId },
        },
      },
      create: {
        name: categoryName,
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

const fetchLocationCategories = async () => {
  const defaultReturnArray: {
    id: number;
    name: string;
  }[] = [];
  try {
    const locationCategories = await prisma.locationCategory.findMany();
    return {
      statusCode: 200,
      message: "Location categories fetch successful",
      categories: locationCategories,
    };
  } catch (e) {
    return {
      statusCode: 500,
      message: "Error during category fetch",
      categories: defaultReturnArray,
    };
  }
};

export { upsertLocationCategory, fetchLocationCategories };
export { type LocationCategories };
