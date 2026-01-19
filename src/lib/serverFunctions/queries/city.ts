import { prisma } from "@lib/prisma";
import { $Enums } from "@prisma/client";

import { FetchCitiesParams } from "../../../app/api/admin/cities/route";
import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

export type FetchCitiesResponse = Awaited<
  ReturnType<typeof fetchCities>
>["data"];

const fetchCities = async (params: FetchCitiesParams) => {
  try {
    const cities: ({
      narrowAdministrativeUnit?: {
        id: number;
        name: string;
      }[];
      intermediateAdministrativeUnit?: {
        id: number;
        name: string;
      }[];
      broadAdministrativeUnit?: {
        id: number;
        name: string;
      }[];
    } & {
      state: $Enums.BrazilianStates;
      id: number;
      name: string;
      createdAt: Date | null;
      updatedAt: Date | null;
    })[] = await prisma.city.findMany({
      where: { state: params.state },
      ...(params.includeAdminstrativeRegions ?
        {
          include: {
            narrowAdministrativeUnit: {
              select: { id: true, name: true },
            },
            intermediateAdministrativeUnit: {
              select: { id: true, name: true },
            },
            broadAdministrativeUnit: {
              select: { id: true, name: true },
            },
          },
        }
      : {}),
    });
    cities.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        cities: cities,
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        cities: [],
      },
    };
  }
};

export { fetchCities };
