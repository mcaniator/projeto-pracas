import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import { prisma } from "@/lib/prisma";
import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

import { getBehavioralMapProtocolStructure } from "./behavioralMapProtocolStructure";
import { getFormSubmissionData } from "./formSubmission";

export const fetchBehavioralMapsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  itemsPerPage: z.coerce.number().int().positive().max(100).default(100),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  behavioralMapProtocolId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
});
export type FetchBehavioralMapsParams = z.infer<
  typeof fetchBehavioralMapsParamsSchema
>;
export const fetchBehavioralMaps = async ({
  params,
}: APIRequestParams<FetchBehavioralMapsParams>) => {
  const finalStatus =
    params!.finalizationStatus === FINALIZATION_STATUS.FINALIZED ? true
    : params!.finalizationStatus === FINALIZATION_STATUS.NOT_FINALIZED ? false
    : undefined;
  try {
    const rows = await prisma.behavioralMap.findMany({
      where: {
        startDate: { gte: params!.startDate, lte: params!.endDate },
        userId: params!.userId,
        location: {
          id: params!.locationId,
          cityId: params!.cityId,
          broadAdministrativeUnitId: params!.broadUnitId,
          intermediateAdministrativeUnitId: params!.intermediateUnitId,
          narrowAdministrativeUnitId: params!.narrowUnitId,
        },
        behavioralMapProtocolId: params!.behavioralMapProtocolId,
        isFinalized: finalStatus,
      },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      skip: (params!.page - 1) * params!.itemsPerPage,
      take: params!.itemsPerPage + 1,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isFinalized: true,
        user: { select: { id: true, username: true } },
        location: { select: { id: true, name: true } },
        behavioralMapProtocol: { select: { id: true, name: true } },
      },
    });
    const hasMore = rows.length > params!.itemsPerPage;
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { behavioralMaps: rows.slice(0, params!.itemsPerPage), hasMore },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar mapas comportamentais!",
      } as APIResponseInfo,
      data: { behavioralMaps: [], hasMore: false },
    };
  }
};
export type FetchBehavioralMapsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchBehavioralMaps>>["data"]
>;

export const fetchBehavioralMapUsers = async () => {
  const users = await prisma.user.findMany({
    where: { behavioralMaps: { some: {} } },
    select: { id: true, username: true },
  });
  return {
    responseInfo: { statusCode: 200 } as APIResponseInfo,
    data: { users },
  };
};
export type FetchBehavioralMapUsersResponse = NonNullable<
  Awaited<ReturnType<typeof fetchBehavioralMapUsers>>["data"]
>;

export type GetBehavioralMapSubmissionDataParams = {
  behavioralMapId: number;
};

export const getBehavioralMapSubmissionData = async ({
  behavioralMapId,
}: GetBehavioralMapSubmissionDataParams) => {
  const behavioralMap = await prisma.behavioralMap.findUnique({
    where: { id: behavioralMapId },
    select: {
      behavioralMapProtocolId: true,
      formSubmissionId: true,
      groups: { select: { id: true, label: true } },
      personObservations: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          quantity: true,
          observedAt: true,
          groupMemberships: {
            select: { behavioralMapGroupId: true },
          },
          characteristics: {
            select: { personCharacteristicId: true },
          },
          linksAsObservationA: {
            select: { id: true, observationBId: true, description: true },
          },
          linksAsObservationB: {
            select: { id: true, observationAId: true, description: true },
          },
          responseGeometryLinks: {
            select: { responseGeometryId: true, description: true },
          },
        },
      },
    },
  });

  if (!behavioralMap) {
    throw new Error("Mapa comportamental não encontrado");
  }

  const [behavioralMapProtocolStructure, formSubmission, observationPositions] =
    await Promise.all([
      getBehavioralMapProtocolStructure({
        behavioralMapProtocolId: behavioralMap.behavioralMapProtocolId,
      }),
      behavioralMap.formSubmissionId ?
        getFormSubmissionData({
          formSubmissionId: behavioralMap.formSubmissionId,
          includeCalculations: true,
        })
      : Promise.resolve(null),
      prisma.$queryRaw<{ id: number; longitude: number; latitude: number }[]>`
        SELECT id, ST_X(position) AS longitude, ST_Y(position) AS latitude
        FROM behavioral_map_person_observation
        WHERE behavioral_map_id = ${behavioralMapId} AND position IS NOT NULL
      `,
    ]);

  const positionsByObservationId = new Map(
    observationPositions.map(({ id, ...position }) => [id, position]),
  );

  return {
    formSubmission,
    behavioralMapProtocolStructure,
    groups: behavioralMap.groups,
    personObservations: behavioralMap.personObservations.map((observation) => ({
      ...observation,
      position: positionsByObservationId.get(observation.id) ?? null,
    })),
  };
};

export type GetBehavioralMapSubmissionDataResult = Awaited<
  ReturnType<typeof getBehavioralMapSubmissionData>
>;

export const fetchBehavioralMapDetailsParamsSchema = z.object({
  behavioralMapId: z.coerce.number().int().positive(),
});
export type FetchBehavioralMapDetailsParams = z.infer<
  typeof fetchBehavioralMapDetailsParamsSchema
>;

export const fetchBehavioralMapDetails = async ({
  params,
}: APIRequestParams<FetchBehavioralMapDetailsParams>) => {
  try {
    const behavioralMap = await prisma.behavioralMap.findUnique({
      where: { id: params!.behavioralMapId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isFinalized: true,
        updatedAt: true,
        user: { select: { id: true, username: true } },
        location: { select: { id: true, name: true } },
      },
    });

    if (!behavioralMap) {
      return {
        responseInfo: {
          statusCode: 404,
          message: "Mapa comportamental não encontrado!",
        } as APIResponseInfo,
        data: null,
      };
    }

    const [behavioralMapSubmission, locationPolygon] = await Promise.all([
      getBehavioralMapSubmissionData({ behavioralMapId: behavioralMap.id }),
      prisma.$queryRaw<{ st_asgeojson: string | null }[]>`
        SELECT CASE WHEN ST_IsEmpty(polygon) THEN NULL ELSE ST_AsGeoJSON(polygon)::text END AS st_asgeojson
        FROM location WHERE id = ${behavioralMap.location.id}
      `,
    ]);

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: {
        behavioralMapDetails: {
          ...behavioralMap,
          location: {
            ...behavioralMap.location,
            st_asgeojson: locationPolygon[0]?.st_asgeojson ?? null,
          },
          behavioralMapSubmission,
        },
      },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar mapa comportamental!",
      } as APIResponseInfo,
      data: null,
    };
  }
};
export type FetchBehavioralMapDetailsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchBehavioralMapDetails>>["data"]
>;
