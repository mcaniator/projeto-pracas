"use server";

import { prisma } from "@/lib/prisma";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

type LocationTypes = Awaited<ReturnType<typeof fetchLocationTypes>>;

const fetchLocationTypes = async () => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
  } catch (e) {
    return {
      statusCode: 401,
      message: "No permission to fetch location types",
      types: [],
    };
  }
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
      types: [],
    };
  }
};

export { fetchLocationTypes };
export { type LocationTypes };
