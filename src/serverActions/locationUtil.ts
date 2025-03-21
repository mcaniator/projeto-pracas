"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { BrazilianStates, Location } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { getPolygonsFromShp } from "./managePolygons";
import { addPolygonFromWKT, hasPolygon } from "./managePolygons";

interface LocationWithCity extends Location {
  hasGeometry: boolean;
  type: {
    id: number;
    name: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
  narrowAdministrativeUnit: {
    id: number;
    name: string;
    city: {
      name: string;
      state: BrazilianStates;
    } | null;
  } | null;
  intermediateAdministrativeUnit: {
    id: number;
    name: string;
    city: {
      name: string;
      state: BrazilianStates;
    } | null;
  } | null;
  broadAdministrativeUnit: {
    id: number;
    name: string;
    city: {
      name: string;
      state: BrazilianStates;
    } | null;
  } | null;
}

const deleteLocation = async (id: number) => {
  try {
    await prisma.location.delete({
      where: {
        id,
      },
    });
    revalidateTag("location");
    return { statusCode: 200 };
  } catch (err) {
    return { statusCode: 500 };
  }
};

const searchLocationsById = async (id: number) => {
  let foundLocation;
  try {
    foundLocation = await prisma.location.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
        type: true,
        narrowAdministrativeUnit: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true,
                state: true,
              },
            },
          },
        },
        intermediateAdministrativeUnit: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true,
                state: true,
              },
            },
          },
        },
        broadAdministrativeUnit: {
          select: {
            id: true,
            name: true,
            city: {
              select: {
                name: true,
                state: true,
              },
            },
          },
        },
      },
    });
    if (!foundLocation) {
      return { statusCode: 404, location: null };
    }
    const locationHasPolygon = await hasPolygon(id);

    foundLocation = {
      ...foundLocation,
      hasGeometry: locationHasPolygon ?? false,
    };
    return { statusCode: 200, location: foundLocation };
    //TODO
  } catch (err) {
    return { statusCode: 500, location: null };
  }
};

const searchLocationNameById = async (id: number) => {
  const location = await prisma.location.findUnique({
    where: {
      id: id,
    },
    select: {
      name: true,
    },
  });
  if (location) return location.name;
  else return "Erro ao encontrar nome";
};

const updateLocation = async (
  prevState: { statusCode: number; message: string },
  formData: FormData,
) => {
  let parseId;
  try {
    parseId = z.coerce
      .number()
      .int()
      .finite()
      .nonnegative()
      .parse(formData.get("locationId"));
  } catch (e) {
    return {
      statusCode: 400,
      message: "Invalid id",
    };
  }

  let locationToUpdate;
  const narrowAdministrativeUnitName = formData.get("narrowAdministrativeUnit");
  const intermediateAdministrativeUnitName = formData.get(
    "intermediateAdministrativeUnit",
  );
  const broadAdministrativeUnitName = formData.get("broadAdministrativeUnit");

  const cityName = formData.get("city");
  const stateName = formData.get("state") as string;
  if (cityName && stateName === "NONE") {
    return { statusCode: 400, message: "City sent without state" };
  }
  try {
    locationToUpdate = locationSchema.parse({
      name: formData.get("name"),
      popularName: formData.get("popularName"),
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
      isPark: formData.get("isPark") === "true",
      inactiveNotFound: formData.get("inactiveNotFound") === "true",
    });
  } catch (e) {
    return {
      statusCode: 400,
      message: "Invalid data",
    };
  }
  try {
    await prisma.$transaction(async (prisma) => {
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
      if (
        !narrowAdministrativeUnitId &&
        !intermediateAdministrativeUnitId &&
        !broadAdministrativeUnitId
      ) {
        throw new Error("No administrative unit created or connect");
      }

      const category = formData.get("category");
      const categoryValue =
        category === "" || category === null ? null : String(category);
      const type = formData.get("type");
      const typeValue = category === "" || type === null ? null : String(type);
      let locationTypeId: number | null = null;
      if (typeValue) {
        const locationType = await prisma.locationType.upsert({
          where: {
            name: typeValue,
          },
          update: {},
          create: {
            name: typeValue,
          },
        });
        locationTypeId = locationType.id;
      }
      let locationCategoryId: number | null = null;
      if (categoryValue) {
        const locationCategory = await prisma.locationCategory.upsert({
          where: {
            name: categoryValue,
          },
          update: {},
          create: {
            name: categoryValue,
          },
        });
        locationCategoryId = locationCategory.id;
      }

      await prisma.location.update({
        where: {
          id: parseId,
        },
        data: {
          ...locationToUpdate,
          narrowAdministrativeUnitId,
          intermediateAdministrativeUnitId,
          broadAdministrativeUnitId,
          typeId: locationTypeId,
          categoryId: locationCategoryId,
        },
      });
    });

    const shpFile = formData.get("file");
    if (!shpFile) {
      revalidateTag("location");
      return { statusCode: 200, message: "Location updated" };
    }
    try {
      const WKT = await getPolygonsFromShp(formData.get("file") as File);
      WKT && (await addPolygonFromWKT(WKT, parseId, prisma));
      revalidateTag("location");
      return { statusCode: 200, message: "Location updated" };
    } catch (e) {
      return { statusCode: 400, message: "Error during polygon save" };
    }
  } catch (e) {
    return { statusCode: 400, message: "Database error" };
  }
};

export {
  deleteLocation,
  searchLocationsById,
  searchLocationNameById,
  updateLocation,
};

export type { LocationWithCity };
