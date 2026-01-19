"use server";

import { TallyCreationFormType } from "@/app/admin/parks/[locationId]/tallys/tallyCreation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { getSessionUserId } from "@auth/userUtil";
import {
  ActivityType,
  AgeGroupType,
  GenderType,
} from "@customTypes/tallys/person";
import PermissionError from "@errors/permissionError";
import { WeatherConditions } from "@prisma/client";
import { fetchTallysByLocationId } from "@queries/tally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import {
  CommercialActivity,
  commercialActivitySchema,
  tallyPersonArraySchema,
} from "@zodValidators";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

interface WeatherStats {
  temperature: number | null;
  weather: WeatherConditions;
}

interface PersonWithQuantity {
  person: {
    gender: GenderType;
    ageGroup: AgeGroupType;
    activity: ActivityType;
    isTraversing: boolean;
    isPersonWithImpairment: boolean;
    isInApparentIllicitActivity: boolean;
    isPersonWithoutHousing: boolean;
  };
  quantity: number;
}
const _fetchTallysByLocationId = async (locationId: number) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return { statusCode: 401, tallys: [] };
  }
  const response = await fetchTallysByLocationId(locationId);
  return response;
};

export const _createTallyV2 = async (
  prevState: { responseInfo: APIResponseInfo },
  formData: FormData,
) => {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["TALLY_EDITOR", "TALLY_MANAGER"],
    });
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 401,
        message: "Permissão inválida!",
      } as APIResponseInfo,
    };
  }
  const session = await auth();
  if (!session || !session.user) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Não foi possível obter os dados do usuário logado!",
      } as APIResponseInfo,
    };
  }
  try {
    const locationId = z.coerce.number().parse(formData.get("locationId"));
    const userId = z.string().parse(session.user.id);
    const startDate = z.coerce.date().parse(formData.get("startDate"));
    try {
      await prisma.tally.create({
        data: {
          startDate: new Date(startDate),
          user: { connect: { id: userId } },
          location: { connect: { id: Number(locationId) } },
        },
      });
      revalidateTag("tally");
      return {
        responseInfo: {
          statusCode: 201,
          showSuccessCard: true,
          message: `Contagem criada!`,
        } as APIResponseInfo,
      };
    } catch (error) {
      return {
        responseInfo: {
          statusCode: 500,
          message: "Erro ao criar contagem!",
        } as APIResponseInfo,
      };
    }
  } catch (e) {
    console.log(e);
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
};

const _createTally = async (
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

const _saveOngoingTallyData = async (
  tallyId: number,
  weatherStats: WeatherStats,
  tallyMap: Map<string, number>,
  commercialActivities: CommercialActivity,
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
      GenderType,
      AgeGroupType,
      ActivityType,
      string,
      string,
      string,
      string,
    ];
    persons.push({
      quantity,
      person: {
        gender,
        ageGroup,
        activity,
        isTraversing: isTraversing === "true",
        isPersonWithImpairment: isPersonWithImpairment === "true",
        isInApparentIllicitActivity: isInApparentIllicitActivity === "true",
        isPersonWithoutHousing: isPersonWithoutHousing === "true",
      },
    });
  });
  const parsedTallyPersonArray = tallyPersonArraySchema.safeParse(persons);
  if (!parsedTallyPersonArray.success) {
    return { statusCode: 400 };
  }
  const parsedCommercialActivities =
    commercialActivitySchema.safeParse(commercialActivities);
  if (!parsedCommercialActivities.success) {
    return { statusCode: 400 };
  }
  try {
    await prisma.tally.update({
      where: {
        id: tallyId,
      },
      data: {
        temperature: weatherStats.temperature,
        weatherCondition: weatherStats.weather,
        animalsAmount: complementaryData.animalsAmount,
        groups: complementaryData.groupsAmount,
        commercialActivities: parsedCommercialActivities.data,
        tallyPerson: parsedTallyPersonArray.data,
        endDate: endDate,
      },
    });
    return { statusCode: 200 };
  } catch (error) {
    return { statusCode: 500 };
  }
};

const _deleteTallys = async (tallysIds: number[]) => {
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

const _redirectToTallysList = (locationId: number) => {
  redirect(`/admin/tallys`);
};

export {
  _fetchTallysByLocationId,
  _createTally,
  _saveOngoingTallyData,
  _deleteTallys,
  _redirectToTallysList,
};
