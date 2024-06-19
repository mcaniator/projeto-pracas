"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { addPolygon } from "./managePolygons";

const createLocation = async (
  _curStatus: { errorCode: number; errorMessage: string },
  formData: FormData,
) => {
  let location;
  try {
    location = locationSchema.parse({
      name: formData.get("name"),
      firstStreet: formData.get("firstStreet"),
      secondStreet: formData.get("secondStreet"),
      creationYear:
        formData.get("creationYear") === "" ?
          undefined
        : formData.get("creationYear"),
      lastMaintenanceYear:
        formData.get("lastMaintenanceYear") === "" ?
          undefined
        : formData.get("lastMaintenanceYear"),
      overseeingMayor:
        formData.get("overseeingMayor") === "" ?
          undefined
        : formData.get("overseeingMayor"),
      legislation:
        formData.get("legislation") === "" ?
          undefined
        : formData.get("legislation"),
      legalArea:
        formData.get("legalArea") === "" ?
          undefined
        : formData.get("legalArea"),
      incline:
        formData.get("incline") === "" ? undefined : formData.get("incline"),
    });
  } catch (err) {
    return { errorCode: 1, errorMessage: "Invalid data" };
  }

  let result;
  try {
    result = await prisma.location.create({ data: location });
  } catch (err) {
    return { errorCode: 2, errorMessage: "Database error" };
  }

  try {
    const featuresGeoJson = z.string().parse(formData.get("featuresGeoJson"));

    await addPolygon(featuresGeoJson, result.id);
  } catch (err) {
    return {
      errorCode: 3,
      errorMessage: "Error inserting polygon into database",
    };
  }

  revalidateTag("location");

  return { errorCode: 0, errorMessage: "" };
};

const editLocationPolygon = async (id: number, featuresGeoJson: string) => {
  await addPolygon(featuresGeoJson, id);

  revalidateTag("location");

  return { errorCode: 0, errorMessage: "" };
};

export { createLocation, editLocationPolygon };
