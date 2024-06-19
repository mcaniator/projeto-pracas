"use server";

import { prisma } from "@/lib/prisma";
import { administrativeUnitsType, locationType } from "@/lib/zodValidators";

const fetchLocation = async (id: number) => {
  let currentPark;

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
  polygons?: string | null,
) => {
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

    if (polygons) {
      await prisma.$executeRaw`UPDATE location SET polygon = ST_GeomFromText(${polygons}, 4326) WHERE id = ${locationCreated.id}`;
    }
  } catch (error) {
    return { statusCode: 2, errorMessage: "Error creating new location" };
  }

  return { statusCode: 0, errorMessage: "No error" };
};

export { createLocation, fetchLocation };
