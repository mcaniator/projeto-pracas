"use server";

import { prisma } from "@/lib/prisma";
import { Location, Prisma } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

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

const searchLocations = async (name: string) => {
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
    ["locationUtilCache"],
    { tags: ["location"] },
  );

  return await cachedLocations(name);
};

const revalidate = () => {
  revalidateTag("location");
};

export { fetchLocations, handleDelete, revalidate, searchLocations };
