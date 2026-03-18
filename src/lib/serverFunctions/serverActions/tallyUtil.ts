"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { getSessionUserId } from "@auth/userUtil";
import {
  ActivityType,
  AgeGroupType,
  GenderType,
} from "@customTypes/tallys/person";
import { WeatherConditions } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import {
  CommercialActivity,
  commercialActivitySchema,
  tallyPersonArraySchema,
} from "@zodValidators";
import { revalidateTag } from "next/cache";
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
      const tally = await prisma.tally.create({
        data: {
          startDate: new Date(startDate),
          user: { connect: { id: userId } },
          location: { connect: { id: Number(locationId) } },
        },
        select: {
          id: true,
        },
      });
      revalidateTag("tally");
      return {
        responseInfo: {
          statusCode: 201,
          showSuccessCard: true,
          message: `Contagem criada!`,
        } as APIResponseInfo,
        data: {
          tallyId: tally.id,
        },
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
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
};

const _saveOngoingTallyData = async ({
  tallyId,
  weatherStats,
  tallyMap,
  commercialActivities,
  complementaryData,
  startDate,
  endDate,
}: {
  tallyId: number;
  weatherStats: WeatherStats;
  tallyMap: Map<string, number>;
  commercialActivities: CommercialActivity;
  complementaryData: { animalsAmount: number; groupsAmount: number };
  startDate: Date;
  endDate: Date | null;
}) => {
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
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
  }
  const parsedCommercialActivities =
    commercialActivitySchema.safeParse(commercialActivities);
  if (!parsedCommercialActivities.success) {
    return {
      responseInfo: {
        statusCode: 400,
        message: "Dados inválidos!",
      } as APIResponseInfo,
    };
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
        startDate: startDate,
        endDate: endDate,
      },
    });
    return {
      responseInfo: {
        statusCode: 200,
        message: "Contagem salva com sucesso!",
        showSuccessCard: true,
      } as APIResponseInfo,
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao salvar contagem!",
      } as APIResponseInfo,
    };
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

export { _saveOngoingTallyData, _deleteTallys };
