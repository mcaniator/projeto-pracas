"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { BrazilianStates, Location, Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

import { ufToStateMap } from "../lib/types/brazilianFederativeUnits";
import { getPolygonsFromShp } from "./getPolygonsFromShp";
import { addPolygonFromWKT } from "./managePolygons";

interface LocationWithCity extends Location {
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

const handleDelete = async (parkID: number) => {
  try {
    await prisma.location.delete({
      where: {
        id: parkID,
      },
    });
    revalidateTag("location");
    return { statusCode: 200 };
  } catch (err) {
    return { statusCode: 500 };
  }
};

const fetchLocations = async () => {
  const locationsType = Prisma.validator<Prisma.LocationDefaultArgs>()({
    select: { id: true, name: true },
  });

  let locations: Prisma.LocationGetPayload<typeof locationsType>[] = [];

  try {
    locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  } catch (err) {
    // console.error(`Erro ao recuperar locais`, err);
  }

  return locations;
};

const searchLocationsByName = async (name: string) => {
  const cachedLocations = unstable_cache(
    async (name: string): Promise<Location[]> => {
      if (name.length < 2) return [];

      let foundLocations: Location[] = [];

      try {
        foundLocations = await prisma.location.findMany({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
        });
      } catch (err) {
        // console.error(err);
      }

      return foundLocations;
    },
    ["searchLocationsByNameCache"],
    { tags: ["location", "database"] },
  );

  return await cachedLocations(name);
};

const searchLocationsById = async (id: number) => {
  const cachedLocations = unstable_cache(
    async (id: number): Promise<LocationWithCity | undefined | null> => {
      let foundLocation;
      try {
        foundLocation = await prisma.location.findUnique({
          where: {
            id: id,
          },
          include: {
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
      } catch (err) {
        // console.error(err);
      }

      return foundLocation;
    },
    ["searchLocationsByIdCache"],
    { tags: ["location", "database"] },
  );

  return await cachedLocations(id);
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
  prevState: { statusCode: number },
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
  const narrowAdministrativeUnitName =
    formData.get("narrowAdministrativeUnitSelect") !== "CREATE" ?
      formData.get("narrowAdministrativeUnitSelect")
    : formData.get("narrowAdministrativeUnit");
  const intermediateAdministrativeUnitName =
    formData.get("intermediateAdministrativeUnitSelect") !== "CREATE" ?
      formData.get("intermediateAdministrativeUnitSelect")
    : formData.get("intermediateAdministrativeUnit");
  const broadAdministrativeUnitName =
    formData.get("broadAdministrativeUnitSelect") !== "CREATE" ?
      formData.get("broadAdministrativeUnitSelect")
    : formData.get("broadAdministrativeUnit");

  const cityName =
    formData.get("cityNameSelect") !== "CREATE" ?
      (formData.get("cityNameSelect") as string)
    : (formData.get("cityName") as string | null);
  const UFName = formData.get("stateName") as string;
  const stateName = ufToStateMap.get(UFName);
  if (cityName && stateName === "NONE") {
    return { statusCode: 400, message: "City sent without state" };
  }
  try {
    const lastMaintenanceYear = formData.get("lastMaintenanceYear");
    const creationYear = formData.get("creationYear");

    locationToUpdate = locationSchema.parse({
      name: formData.get("name"),
      firstStreet: formData.get("firstStreet"),
      secondStreet: formData.get("secondStreet"),
      inactiveNotFound: formData.get("inactiveNotFound") === "on",
      isPark: formData.get("isPark") === "on",
      notes: formData.get("notes") !== "" ? formData.get("notes") : undefined,
      creationYear:
        (
          creationYear !== null &&
          creationYear !== "" &&
          !(creationYear instanceof File)
        ) ?
          new Date(creationYear).toISOString()
        : undefined,
      lastMaintenanceYear:
        (
          lastMaintenanceYear !== null &&
          lastMaintenanceYear !== "" &&
          !(lastMaintenanceYear instanceof File)
        ) ?
          new Date(lastMaintenanceYear).toISOString()
        : undefined,
      overseeingMayor:
        formData.get("overseeingMayor") !== "" ?
          formData.get("overseeingMayor")
        : undefined,
      legislation:
        formData.get("legislation") !== "" ?
          formData.get("legislation")
        : undefined,
      usableArea:
        formData.get("usableArea") !== "" ?
          formData.get("usableArea")
        : undefined,
      legalArea:
        formData.get("legalArea") !== "" ?
          formData.get("legalArea")
        : undefined,
      incline:
        formData.get("incline") !== "" ? formData.get("incline") : undefined,
    });
  } catch (e) {
    return {
      statusCode: 400,
      message: "Invalid data",
    };
  }
  try {
    if (cityName) {
      const city = await prisma.city.upsert({
        where: {
          name_state: {
            name: cityName,
            state: stateName as BrazilianStates,
          },
        },
        update: {},
        create: {
          name: cityName,
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
      await prisma.location.update({
        where: { id: parseId },
        data: {
          ...locationToUpdate,
          ...(narrowAdministrativeUnitId && {
            narrowAdministrativeUnit: {
              connect: { id: narrowAdministrativeUnitId },
            },
          }),
          ...(intermediateAdministrativeUnitId && {
            intermediateAdministrativeUnit: {
              connect: { id: intermediateAdministrativeUnitId },
            },
          }),
          ...(broadAdministrativeUnitId && {
            broadAdministrativeUnit: {
              connect: { id: broadAdministrativeUnitId },
            },
          }),
        },
      });
      if (!formData.get("file")) {
        revalidateTag("location");
        return { statusCode: 200, message: "Location updated" };
      }
    } else {
      await prisma.location.update({
        where: { id: parseId },
        data: locationToUpdate,
      });
      if (!formData.get("file")) {
        revalidateTag("location");
        return { statusCode: 200, message: "Location updated" };
      }
    }
  } catch (e) {
    revalidateTag("location");
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }

  try {
    const WKT = await getPolygonsFromShp(formData.get("file") as File);
    WKT && (await addPolygonFromWKT(WKT, parseId));
    revalidateTag("location");
    return { statusCode: 200, message: "Location updated" };
  } catch (e) {
    return { statusCode: 200, message: "Error during polygon save" };
  }
};

export {
  fetchLocations,
  handleDelete,
  searchLocationsById,
  searchLocationsByName,
  searchLocationNameById,
  updateLocation,
};

export type { LocationWithCity };
