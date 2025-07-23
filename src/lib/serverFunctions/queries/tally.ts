import { prisma } from "@lib/prisma";

const fetchTallysByLocationId = async (locationId: number) => {
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
    const tally = await prisma.tally.findUnique({
      where: {
        id: tallyId,
      },
      select: {
        tallyPerson: {
          select: {
            quantity: true,
            ageGroup: true,
            gender: true,
            activity: true,
            isTraversing: true,
            isPersonWithImpairment: true,
            isInApparentIllicitActivity: true,
            isPersonWithoutHousing: true,
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
    const formattedTallyPerson = tally?.tallyPerson.map((p) => {
      return {
        quantity: p.quantity,
        person: {
          ageGroup: p.ageGroup,
          gender: p.gender,
          activity: p.activity,
          isTraversing: p.isTraversing,
          isPersonWithImpairment: p.isPersonWithImpairment,
          isInApparentIllicitActivity: p.isInApparentIllicitActivity,
          isPersonWithoutHousing: p.isPersonWithoutHousing,
        },
      };
    });
    const formattedTally = { ...tally, tallyPerson: formattedTallyPerson! };
    return {
      statusCode: 200,
      tally: formattedTally?.endDate ? null : formattedTally,
    };
  } catch (error) {
    return { statusCode: 500, tally: null };
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
            ageGroup: true,
            gender: true,
            activity: true,
            isTraversing: true,
            isPersonWithImpairment: true,
            isInApparentIllicitActivity: true,
            isPersonWithoutHousing: true,
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

export {
  fetchTallysByLocationId,
  fetchRecentlyCompletedTallys,
  fetchOngoingTallyById,
  fetchFinalizedTallysToDataVisualization,
};
