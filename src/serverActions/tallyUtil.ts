"use server";

import { prisma } from "@/lib/prisma";
import { Tally } from "@prisma/client";

const searchTallysByLocationId = async (locationId: number) => {
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
  foundTallys.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  return foundTallys;
};

export { searchTallysByLocationId };
