"use server";

import { prisma } from "@/lib/prisma";
import { locationSchema } from "@/lib/zodValidators";
import { Location, Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

const handleDelete = async (parkID: number) => {
  try {
    await prisma.location.delete({
      where: {
        id: parkID,
      },
    });
    revalidateTag("location");
  } catch (err) {
    console.error(`Erro ao excluir o local: ${parkID}`, err);
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
    console.error(`Erro ao recuperar locais`, err);
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
        console.error(err);
      }

      return foundLocations;
    },
    ["searchLocationsByNameCache"],
    { tags: ["location"] },
  );

  return await cachedLocations(name);
};

const searchLocationsById = async (id: number) => {
  const cachedLocations = unstable_cache(
    async (id: number): Promise<Location | undefined | null> => {
      let foundLocation;
      try {
        foundLocation = await prisma.location.findUnique({
          where: {
            id: id,
          },
        });
      } catch (err) {
        console.error(err);
      }

      return foundLocation;
    },
    ["searchLocationsByIdCache"],
    { tags: ["location"] },
  );

  return await cachedLocations(id);
};

const updateLocation = async (
  prevState: { statusCode: number },
  formData: FormData,
) => {
  let locationToUpdate;
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

  try {
    locationToUpdate = locationSchema.parse({
      name: formData.get("name"),
      // isPark: formData.get("isPark"),
      // notes: formData.get("notes"),
      // creationYear: formData.get("creationYear"),
      // lastMaintenanceYear: formData.get("lastMaintenanceYear"),
      // overseeingMayor: formData.get("overseeingMayor"),
      // legislation: formData.get("legislation"),
      // usableArea: formData.get("usableArea"),
      // legalArea: formData.get("legalArea"),
      // incline: formData.get("incline"),
      // inactiveNotFound: formData.get("inactiveNotFound"),
    });
  } catch (e) {
    console.log("erro durante o parse");
    return {
      statusCode: 1,
    };
  }

  try {
    await prisma.location.update({
      where: { id: parseId },
      data: locationToUpdate,
    });
  } catch (e) {
    return {
      statusCode: 2,
    };
  }

  revalidateTag("location");
  return {
    statusCode: 0,
  };
};

const revalidate = () => {
  revalidateTag("location");
};

export {
  fetchLocations,
  handleDelete,
  revalidate,
  searchLocationsByName,
  searchLocationsById,
  updateLocation,
};
