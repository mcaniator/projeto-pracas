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
      narrowAdministrativeUnitTitle: string | null;
      intermediateAdministrativeUnitTitle: string | null;
      broadAdministrativeUnitTitle: string | null;
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

    const administrativeUnitsTitlesSugestionsSets: {
      narrow: Set<string>;
      intermediate: Set<string>;
      broad: Set<string>;
    } = {
      narrow: new Set<string>(),
      intermediate: new Set<string>(),
      broad: new Set<string>(),
    };
    if (params.includeUniqueAdminstrativeUnitsTitles) {
      cities.forEach((city) => {
        if (city.narrowAdministrativeUnitTitle) {
          administrativeUnitsTitlesSugestionsSets.narrow.add(
            city.narrowAdministrativeUnitTitle,
          );
        }
        if (city.intermediateAdministrativeUnitTitle) {
          administrativeUnitsTitlesSugestionsSets.intermediate.add(
            city.intermediateAdministrativeUnitTitle,
          );
        }
        if (city.broadAdministrativeUnitTitle) {
          administrativeUnitsTitlesSugestionsSets.broad.add(
            city.broadAdministrativeUnitTitle,
          );
        }
      });
    }

    const uniqueAdminstrativeUnitsTitles =
      params.includeUniqueAdminstrativeUnitsTitles ?
        {
          narrow: Array.from(administrativeUnitsTitlesSugestionsSets.narrow),
          intermediate: Array.from(
            administrativeUnitsTitlesSugestionsSets.intermediate,
          ),
          broad: Array.from(administrativeUnitsTitlesSugestionsSets.broad),
        }
      : null;

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        cities: cities,
        uniqueAdminstrativeUnitsTitles: uniqueAdminstrativeUnitsTitles,
      },
    };
  } catch (error) {
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        cities: [],
        uniqueAdminstrativeUnitsTitles: null,
      },
    };
  }
};

export { fetchCities };
