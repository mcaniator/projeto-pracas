"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { BrazilianStates, Location, Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

import { getPolygonsFromShp } from "./getPolygonsFromShp";
import { addPolygonFromWKT } from "./managePolygons";

interface LocationWithCity extends Location {
  city: {
    name: string;
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
  } catch (err) {
    // console.error(`Erro ao excluir o local: ${parkID}`, err);
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
            city: {
              select: {
                name: true,
                state: true,
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
      statusCode: 1,
    };
  }

  let locationToUpdate;
  const cityName = formData.get("cityName") as string | null;
  const stateName = formData.get("stateName");
  if (cityName && stateName === "NONE") {
    return { statusCode: 1 };
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
      statusCode: 1,
    };
  }

  try {
    await prisma.location.update({
      where: { id: parseId },
      data: {
        ...locationToUpdate,
        city: {
          connectOrCreate: {
            where: {
              name: cityName || undefined,
              state: stateName,
            },
            create: {
              name: cityName,
              state: stateName,
            },
          },
        },
      },
    });
  } catch (e) {
    return {
      statusCode: 2,
    };
  }
  if (formData.get("file")) {
    const WKT = await getPolygonsFromShp(formData.get("file") as File);
    WKT && (await addPolygonFromWKT(WKT, parseId));
  }

  revalidateTag("location");
  return {
    statusCode: 0,
  };
};

export {
  fetchLocations,
  handleDelete,
  searchLocationsById,
  searchLocationsByName,
  searchLocationNameById,
  updateLocation,
};
