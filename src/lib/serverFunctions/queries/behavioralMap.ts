import { FINALIZATION_STATUS } from "@/lib/enums/finalizationStatus";
import { prisma } from "@/lib/prisma";
import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

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
