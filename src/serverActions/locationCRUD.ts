"use server";

import { prisma } from "@/lib/prisma";
import { administrativeUnitsType, locationType } from "@/lib/zodValidators";
import { Location } from "@prisma/client";

import { getPolygonsFromShp } from "./getPolygonsFromShp";

const fetchLocation = async (id: number) => {
  let currentPark: Location | null = null;

  try {
    currentPark = await prisma.location.findUnique({
      where: {
        id: id,
      },
    });
  } catch (error) {
    return { statusCode: 1, errorMessage: "Error fetching location id" };
  }

  return currentPark;
};

const createLocation = async (
  content: locationType,
  administrativeUnits: administrativeUnitsType,
  cityID: number,
  polygonContent: string | null,
  shpFileForm: FormData | null,
) => {
  if (shpFileForm) {
    const shpFile: FormDataEntryValue | null = shpFileForm.get("shpFile");
    if (
      shpFile instanceof Blob &&
      shpFile.name &&
      shpFile.lastModified &&
      shpFile.size != 0
    ) {
      polygonContent = await getPolygonsFromShp(shpFile);
    }
  }

  try {
    const locationCreated = await prisma.location.create({
      data: {
        ...content,
        narrowAdministrativeUnit: {
          connectOrCreate:
            administrativeUnits.narrowAdministrativeUnit ?
              {
                where: {
                  cityId_narrowUnitName: {
                    cityId: cityID,
                    name: administrativeUnits.narrowAdministrativeUnit,
                  },
                },
                create: {
                  cityId: cityID,
                  name: administrativeUnits.narrowAdministrativeUnit,
                },
              }
            : undefined,
        },
        intermediateAdministrativeUnit:
          administrativeUnits.intermediateAdministrativeUnit ?
            {
              connectOrCreate: {
                where: {
                  cityId_intermediateUnitName: {
                    cityId: cityID,
                    name: administrativeUnits.intermediateAdministrativeUnit,
                  },
                },
                create: {
                  cityId: cityID,
                  name: administrativeUnits.intermediateAdministrativeUnit,
                },
              },
            }
          : undefined,
        broadAdministrativeUnit:
          administrativeUnits.broadAdministrativeUnit ?
            {
              connectOrCreate: {
                where: {
                  cityId_broadUnitName: {
                    cityId: cityID,
                    name: administrativeUnits.broadAdministrativeUnit,
                  },
                },
                create: {
                  cityId: cityID,
                  name: administrativeUnits.broadAdministrativeUnit,
                },
              },
            }
          : undefined,
      },
    });
    if (polygonContent) {
      await prisma.$executeRaw`UPDATE location
    SET polygon = ST_GeomFromText(${polygonContent},4326)
    WHERE id = ${locationCreated.id}`;
    }
  } catch (error) {
    return { statusCode: 2, errorMessage: "Error creating new location" };
  }
};

export { createLocation, fetchLocation };
