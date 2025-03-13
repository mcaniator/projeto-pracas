"use server";

import { prisma } from "@/lib/prisma";

type LocationCategories = Awaited<ReturnType<typeof fetchLocationCategories>>;

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

export { fetchLocationCategories };
export { type LocationCategories };
