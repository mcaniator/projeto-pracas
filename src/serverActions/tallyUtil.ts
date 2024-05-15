"use server";

import { prisma } from "@/lib/prisma";
import { tallyDataFetchedToTallyListType } from "@/lib/zodValidators";

const searchTallysByLocationId = async (locationId: number) => {
  let foundTallys: tallyDataFetchedToTallyListType[] = [];

  try {
    foundTallys = await prisma.tally.findMany({
      where: {
        locationId: locationId,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        observer: true,
      },
    });
  } catch (err) {
    // console.error(err);
  }
  foundTallys.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  return foundTallys;
};

export { searchTallysByLocationId };
