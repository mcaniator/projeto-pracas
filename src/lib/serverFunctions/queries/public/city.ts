import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { $Enums, BrazilianStates } from "@prisma/client";
import { z } from "zod";

export const publicFetchCitiesParamsSchema = z.object({
  state: z.nativeEnum(BrazilianStates),
  includeAdminstrativeRegions: z.coerce.boolean().optional(),
});

export type PublicFetchCitiesParams = z.infer<
  typeof publicFetchCitiesParamsSchema
>;

export type PublicFetchCitiesResponse = Awaited<
  ReturnType<typeof publicFetchCities>
>["data"];

const publicFetchCities = async (
  request: APIRequestParams<PublicFetchCitiesParams>,
) => {
  const params = request.params!;
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
      where: {
        state: params.state,
        locations: {
          some: {
            isPublic: true,
          },
        },
      },
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
        statusCode: 500,
      } as APIResponseInfo,
      data: {
        cities: [],
        uniqueAdminstrativeUnitsTitles: null,
      },
    };
  }
};

export { publicFetchCities };
