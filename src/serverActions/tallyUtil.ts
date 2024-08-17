"use server";

import { TallyCreationFormType } from "@/components/singleUse/admin/tallys/tallyCreation";
import { TallyDataFetchedToTallyList } from "@/components/singleUse/admin/tallys/tallyListPage";
import { prisma } from "@/lib/prisma";
import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface WeatherStats {
  temperature: number | null;
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
const fetchTallysByLocationId = async (locationId: number) => {
  let foundTallys: TallyDataFetchedToTallyList[] = [];

  try {
    foundTallys = await prisma.tally.findMany({
      where: {
        locationId: locationId,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  } catch (error) {
    return null;
  }
  foundTallys.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  return foundTallys;
};

const fetchOngoingTallyById = async (tallyId: number) => {
  try {
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
        user: {
          select: {
            username: true,
            id: true,
          },
        },
        animalsAmount: true,
        temperature: true,
        weatherCondition: true,
        groups: true,
        commercialActivities: true,
      },
    });
    return tally?.endDate ? null : tally;
  } catch (error) {
    return null;
  }
};

const fetchFinalizedTallysToDataVisualization = async (tallysIds: number[]) => {
  try {
    let tallys = await prisma.tally.findMany({
      where: {
        id: {
          in: tallysIds,
        },
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
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    tallys = tallys.filter((tally) => {
      if (tally.endDate) return true;
    });
    tallys.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    return tallys;
  } catch (error) {
    return null;
  }
};

const createTally = async (
  prevState: TallyCreationFormType,
  formData: FormData,
) => {
  const locationId = formData.get("locationId") as string;
  const userId = formData.get("userId") as string;
  const date = formData.get("date") as string;

  if (!userId || !date) {
    return {
      locationId: locationId,
      userId: userId,
      date: date,
      errors: {
        userId: !userId,
        date: !date,
      },
    };
  }
  try {
    await prisma.tally.create({
      data: {
        location: {
          connect: {
            id: Number(locationId),
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        startDate: new Date(date),
      },
    });
    revalidatePath(`/admin/parks/${locationId}/tallys`);
    return {
      locationId: locationId,
      userId: "",
      date: date,
      errors: {
        userId: false,
        date: false,
      },
    };
  } catch (error) {
    return {
      locationId: locationId,
      userId: userId,
      date: date,
      errors: {
        userId: !userId,
        date: !date,
      },
    };
  }
};

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
          commercialActivities:
            Object.keys(commercialActivities).length > 0 ?
              commercialActivities
            : undefined,
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
  } catch (error) {
    return null;
  }
};

const deleteTallys = async (tallysIds: number[]) => {
  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.tallyPerson.deleteMany({
        where: {
          tallyId: {
            in: tallysIds,
          },
        },
      });

      await prisma.tally.deleteMany({
        where: {
          id: {
            in: tallysIds,
          },
        },
      });
    });
  } catch (error) {
    return { statusCode: 1 };
  }
};

const redirectToTallysList = (locationId: number) => {
  redirect(`/admin/parks/${locationId}/tallys`);
};

export {
  fetchTallysByLocationId,
  createTally,
  fetchOngoingTallyById,
  fetchFinalizedTallysToDataVisualization,
  saveOngoingTallyData,
  deleteTallys,
  redirectToTallysList,
};
