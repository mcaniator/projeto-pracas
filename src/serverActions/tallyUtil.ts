"use server";

import { TallyCreationFormType } from "@/components/singleUse/admin/tallys/tallyCreation";
import { prisma } from "@/lib/prisma";
import { Activity, AgeGroup, Gender, WeatherConditions } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import PermissionError from "../errors/permissionError";
import { getSessionUserId } from "../lib/auth/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "../serverOnly/checkPermission";

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
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, tallys: [] };
  }
  try {
    const tallys = await prisma.tally.findMany({
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
            id: true,
          },
        },
      },
    });
    tallys.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    return { statusCode: 200, tallys };
  } catch (error) {
    return { statusCode: 500, tallys: [] };
  }
};

const fetchRecentlyCompletedTallys = async () => {
  const returnObj: {
    statusCode: number;
    tallys: {
      id: number;
      startDate: Date;
      endDate: Date | null;
      location: {
        name: string;
        id: number;
      };
      user: {
        username: string | null;
      };
    }[];
  } = { statusCode: 500, tallys: [] };
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, tallys: [] };
  }
  try {
    const tallys = await prisma.tally.findMany({
      where: {
        NOT: {
          endDate: null,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    returnObj.statusCode = 200;
    returnObj.tallys = tallys;
  } catch (e) {
    return returnObj;
  }
  return returnObj;
};

const fetchOngoingTallyById = async (tallyId: number) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["TALLY_EDITOR", "TALLY_MANAGER"],
    });
  } catch (e) {
    return { statusCode: 401, tally: null };
  }
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
            id: true,
            username: true,
          },
        },
        animalsAmount: true,
        temperature: true,
        weatherCondition: true,
        groups: true,
        commercialActivities: true,
      },
    });
    return { statusCode: 200, tally: tally?.endDate ? null : tally };
  } catch (error) {
    return { statusCode: 500, tally: null };
  }
};

const fetchFinalizedTallysToDataVisualization = async (tallysIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, tallys: [] };
  }
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
    return { statusCode: 200, tallys };
  } catch (error) {
    return { statusCode: 500, tallys: null };
  }
};

const createTally = async (
  prevState: TallyCreationFormType,
  formData: FormData,
) => {
  const locationId = formData.get("locationId") as string;
  const userId = formData.get("userId") as string;
  const date = formData.get("date") as string;

  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["TALLY_EDITOR", "TALLY_MANAGER"],
    });
    if (!userId || !date) {
      return {
        locationId: locationId,
        userId: userId,
        date: date,
        errors: {
          userId: !userId,
          date: !date,
          permission: false,
        },
      };
    }
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
        permission: false,
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
        permission: error instanceof PermissionError,
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
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["TALLY_EDITOR", "TALLY_MANAGER"],
    });
  } catch (e) {
    return { statusCode: 401 };
  }
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
    await prisma.$transaction(
      async (prisma) => {
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
      },
      {
        timeout: 120000,
      },
    );
    return { statusCode: 200 };
  } catch (error) {
    return { statusCode: 500 };
  }
};

const deleteTallys = async (tallysIds: number[]) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["TALLY_MANAGER", "TALLY_EDITOR"],
    });
  } catch (e) {
    return { statusCode: 401 };
  }
  const userId = await getSessionUserId();
  const userTallysAmount = await prisma.tally.count({
    where: {
      id: {
        in: tallysIds,
      },
      userId,
    },
  });
  if (userTallysAmount < tallysIds.length) {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
    } catch (e) {
      return { statusCode: 403 };
    }
  }
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
    return { statusCode: 200 };
  } catch (error) {
    return { statusCode: 500 };
  }
};

const redirectToTallysList = (locationId: number) => {
  redirect(`/admin/parks/${locationId}/tallys`);
};

export {
  fetchTallysByLocationId,
  fetchRecentlyCompletedTallys,
  createTally,
  fetchOngoingTallyById,
  fetchFinalizedTallysToDataVisualization,
  saveOngoingTallyData,
  deleteTallys,
  redirectToTallysList,
};
