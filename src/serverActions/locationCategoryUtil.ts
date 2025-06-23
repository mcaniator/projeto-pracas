"use server";

import { prisma } from "@/lib/prisma";

import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

type LocationCategories = Awaited<ReturnType<typeof fetchLocationCategories>>;

const fetchLocationCategories = async () => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
  } catch (e) {
    return {
      statusCode: 401,
      message: "No permission to fetch location categories",
      categories: [],
    };
  }
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
      categories: [],
    };
  }
};

export { fetchLocationCategories };
export { type LocationCategories };
