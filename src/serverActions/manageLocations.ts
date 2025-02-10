"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { BrazilianStates } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { ufToStateMap } from "../lib/types/brazilianFederativeUnits";
import { getPolygonsFromShp } from "./getPolygonsFromShp";
import { addPolygon, addPolygonFromWKT } from "./managePolygons";

const createLocation = async (
  _curStatus: { statusCode: number; message: string },
  formData: FormData,
) => {
  let location;
  try {
    location = locationSchema.parse({
      name: formData.get("name"),
      firstStreet: formData.get("firstStreet"),
      secondStreet: formData.get("secondStreet"),
      creationYear: formData.get("creationYear"),
      lastMaintenanceYear: formData.get("lastMaintenanceYear"),
      overseeingMayor: formData.get("overseeingMayor"),
      legislation: formData.get("legislation"),
      legalArea: formData.get("legalArea"),
      usableArea: formData.get("usableArea"),
      incline: formData.get("incline"),
      notes: formData.get("notes"),
    });
  } catch (err) {
    return { statusCode: 400, message: "Invalid data" };
  }

  const cityName = formData.get("city");
  const stateName = ufToStateMap.get(formData.get("state") as string);
  const narrowAdministrativeUnitName = formData.get("narrowAdministrativeUnit");
  const intermediateAdministrativeUnitName = formData.get(
    "intermediateAdministrativeUnit",
  );
  const broadAdministrativeUnitName = formData.get("broadAdministrativeUnit");
  let result;
  try {
    await prisma.$transaction(async (prisma) => {
      if (cityName) {
        const city = await prisma.city.upsert({
          where: {
            name_state: {
              name: cityName as string,
              state: stateName as BrazilianStates,
            },
          },
          update: {},
          create: {
            name: cityName as string,
            state: stateName as BrazilianStates,
          },
        });
        let narrowAdministrativeUnitId: number | null = null;
        let intermediateAdministrativeUnitId: number | null = null;
        let broadAdministrativeUnitId: number | null = null;
        if (narrowAdministrativeUnitName) {
          const narrowAdministrativeUnit =
            await prisma.narrowAdministrativeUnit.upsert({
              where: {
                cityId_narrowUnitName: {
                  cityId: city.id,
                  name: narrowAdministrativeUnitName as string,
                },
              },
              update: {},
              create: {
                name: narrowAdministrativeUnitName as string,
                city: {
                  connect: { id: city.id },
                },
              },
            });
          narrowAdministrativeUnitId = narrowAdministrativeUnit.id;
        }
        if (intermediateAdministrativeUnitName) {
          const intermediateAdministrativeUnit =
            await prisma.intermediateAdministrativeUnit.upsert({
              where: {
                cityId_intermediateUnitName: {
                  cityId: city.id,
                  name: intermediateAdministrativeUnitName as string,
                },
              },
              update: {},
              create: {
                name: intermediateAdministrativeUnitName as string,
                city: {
                  connect: { id: city.id },
                },
              },
            });
          intermediateAdministrativeUnitId = intermediateAdministrativeUnit.id;
        }
        if (broadAdministrativeUnitName) {
          const broadAdministrativeUnit =
            await prisma.broadAdministrativeUnit.upsert({
              where: {
                cityId_broadUnitName: {
                  cityId: city.id,
                  name: broadAdministrativeUnitName as string,
                },
              },
              update: {},
              create: {
                name: broadAdministrativeUnitName as string,
                city: {
                  connect: { id: city.id },
                },
              },
            });
          broadAdministrativeUnitId = broadAdministrativeUnit.id;
        }

        result = await prisma.location.create({
          data: {
            ...location,
            narrowAdministrativeUnitId,
            intermediateAdministrativeUnitId,
            broadAdministrativeUnitId,
          },
        });
      } else {
        result = await prisma.location.create({ data: location });
      }
      try {
        if (formData.get("featuresGeoJson")) {
          const featuresGeoJson = z
            .string()
            .parse(formData.get("featuresGeoJson"));

          await addPolygon(featuresGeoJson, result.id);
        }

        if (formData.get("file")) {
          const wkt = await getPolygonsFromShp(formData.get("file") as File);
          if (wkt) {
            await addPolygonFromWKT(wkt, result.id);
          }
        }
      } catch (err) {
        throw new Error("Error inserting polygon into database");
      }
    });
  } catch (err) {
    return { statusCode: 400, message: "Database error" };
  }

  revalidateTag("location");

  return { statusCode: 201, message: "locationCreated" };
};

const editLocationPolygon = async (id: number, featuresGeoJson: string) => {
  await addPolygon(featuresGeoJson, id);

  revalidateTag("location");

  return { errorCode: 0, errorMessage: "" };
};

export { createLocation, editLocationPolygon };
