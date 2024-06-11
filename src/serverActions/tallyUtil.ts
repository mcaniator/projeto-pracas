"use server";

import { prisma } from "@/lib/prisma";
import { tallyDataFetchedToTallyListType } from "@/lib/zodValidators";
import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
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
    select: {
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
      startDate: true,
      endDate: true,
      observer: true,
      animalsAmount: true,
      temperature: true,
      weatherCondition: true,
      groups: true,
      commercialActivities: true,
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

interface WeatherStats {
  temperature: number;
  weather: WeatherConditions;
}
interface CommercialActivitiesObject {
  [key: string]: number;
}
interface PersonWithQuantity {
  gender: Gender;
  ageGroup: AgeGroup;
  activity: Activity;
  isTraversing: boolean;
  isPersonWithImpairment: boolean;
  isInApparentIllicitActivity: boolean;
  isPersonWithoutHousing: boolean;
  quantity: number;
}
const saveOngoingTallyData = async (
  tallyId: number,
  weatherStats: WeatherStats,
  tallyMap: Map<string, number>,
  commercialActivities: CommercialActivitiesObject,
  complementaryData: { animalsAmount: number; groupsAmount: number },
  endDate: Date | null,
) => {
  const persons: PersonWithQuantity[] = [];

  tallyMap.forEach((quantity, key) => {
    const [
      gender,
      ageGroup,
      activity,
      isTraversing,
      isPersonWithImpairment,
      isInApparentIllicitActivity,
      isPersonWithoutHousing,
    ] = key.split("-") as [
      Gender,
      AgeGroup,
      Activity,
      string,
      string,
      string,
      string,
    ];
    persons.push({
      gender,
      ageGroup,
      activity,
      isTraversing: isTraversing === "true",
      isPersonWithImpairment: isPersonWithImpairment === "true",
      isInApparentIllicitActivity: isInApparentIllicitActivity === "true",
      isPersonWithoutHousing: isPersonWithoutHousing === "true",
      quantity,
    });
  });

  console.log("chamou");
  /*commercialActivitiesMap.forEach(
    (quantity, key) => (commercialActivities[key] = quantity),
  );*/

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.tally.update({
        where: {
          id: tallyId,
        },
        data: {
          temperature: weatherStats.temperature,
          weatherCondition: weatherStats.weather,
          animalsAmount: complementaryData.animalsAmount,
          groups: complementaryData.groupsAmount,
          commercialActivities: commercialActivities,
          endDate: endDate,
        },
      });
      for (const person of persons) {
        const { quantity, ...personCharacteristics } = person;
        const databasePerson = await prisma.person.upsert({
          where: {
            person_characteristics: {
              ...personCharacteristics,
            },
          },
          update: {},
          create: {
            ...personCharacteristics,
          },
        });
        await prisma.tallyPerson.upsert({
          where: {
            tally_id_person_id: {
              tallyId: tallyId,
              personId: databasePerson.id,
            },
          },
          update: {
            quantity: quantity,
          },
          create: {
            tally: {
              connect: {
                id: tallyId,
              },
            },
            person: {
              connect: {
                id: databasePerson.id,
              },
            },
            quantity: quantity,
          },
        });
      }
    });
    if (endDate) revalidatePath("/");
  } catch (error) {
    console.log(error);
  }

  console.log(commercialActivities);
};
export {
  searchTallysByLocationId,
  createTallyByUser,
  searchOngoingTallyById,
  saveOngoingTallyData,
};
