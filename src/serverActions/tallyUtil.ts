"use server";

import { prisma } from "@/lib/prisma";
import { tallyDataFetchedToTallyListType } from "@/lib/zodValidators";
import { revalidatePath } from "next/cache";

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

export type FormState = {
  locationId: string;
  observer: string;
  date: string;
  errors: {
    observer: boolean;
    date: boolean;
  };
};

const searchOngoingTallyById = async (tallyId: number) => {
  const tally = await prisma.tally.findUnique({
    where: {
      id: tallyId,
    },
    include: {
      tallyPerson: {
        select: {
          quantity: true,
          person: {
            select: {
              ageGroup: true,
              gender: true,
              activity: true,
              isTraversing: true,
              isPersonWithImpairment: true,
              isInApparentIllicitActivity: true,
              isPersonWithoutHousing: true,
            },
          },
        },
      },
      location: {
        select: {
          name: true,
        },
      },
    },
  });
  return tally?.endDate ? null : tally;
};

const createTallyByUser = async (prevState: FormState, formData: FormData) => {
  const locationId = formData.get("locationId") as string;
  const observer = formData.get("observer") as string;
  const date = formData.get("date") as string;

  if (!observer || !date) {
    return {
      locationId: locationId,
      observer: observer,
      date: date,
      errors: {
        observer: !observer,
        date: !date,
      },
    };
  }
  try {
    await prisma.tally.create({
      data: {
        location: {
          connect: {
            id: parseInt(locationId),
          },
        },
        observer: observer,
        startDate: new Date(date),
      },
    });
    revalidatePath("/");
    return {
      locationId: locationId,
      observer: "",
      date: date,
      errors: {
        observer: false,
        date: false,
      },
    };
  } catch (error) {
    return {
      locationId: locationId,
      observer: observer,
      date: date,
      errors: {
        observer: !observer,
        date: !date,
      },
    };
  }
};
export { searchTallysByLocationId, createTallyByUser, searchOngoingTallyById };
