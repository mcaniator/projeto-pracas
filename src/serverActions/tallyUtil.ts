"use server";

import { prisma } from "@/lib/prisma";
import { Tally } from "@prisma/client";
import { unstable_cache } from "next/cache";

const searchTallysByLocationId = async (locationId: number) => {
  const cachedLocations = unstable_cache(
    async (locationId: number): Promise<Tally[]> => {
      //if (name.length < 2) return [];

      let foundTallys: Tally[] = [];

      try {
        foundTallys = await prisma.tally.findMany({
          where: {
            locationId: locationId,
          },
        });
      } catch (err) {
        // console.error(err);
      }

      return foundTallys;
    },
    ["searchLocationsByNameCache"],
    { tags: ["location", "database"] },
  );

  return await cachedLocations(locationId);
};

export { searchTallysByLocationId };
