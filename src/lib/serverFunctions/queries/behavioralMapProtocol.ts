import { APIRequestParams, APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { booleanFromString } from "@/lib/zodValidators";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const fetchBehavioralMapProtocolsParamsSchema = z.object({
  includeArchived: booleanFromString.nullish(),
});

export type FetchBehavioralMapProtocolsParams = z.infer<typeof fetchBehavioralMapProtocolsParamsSchema>;

export const fetchBehavioralMapProtocols = async (
  request: APIRequestParams<FetchBehavioralMapProtocolsParams>,
) => {
  const params = request.params!;
  try {
    const behavioralMapProtocols = await prisma.behavioralMapProtocol.findMany({
      where: { ...(!params.includeArchived && { archived: false }) },
      select: {
        id: true,
        name: true,
        finalized: true,
        archived: true,
        updatedAt: true,
        _count: { select: { behavioralMaps: true } },
      },
      orderBy: [{ archived: "asc" }, { updatedAt: "desc" }],
    });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { behavioralMapProtocols },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar protocolos de mapas comportamentais!",
      } as APIResponseInfo,
      data: { behavioralMapProtocols: [] },
    };
  }
};

export type FetchBehavioralMapProtocolsResponse = NonNullable<
  Awaited<ReturnType<typeof fetchBehavioralMapProtocols>>["data"]
>;
