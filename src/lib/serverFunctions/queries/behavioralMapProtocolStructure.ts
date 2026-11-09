import { prisma } from "@/lib/prisma";
import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const fetchBehavioralMapProtocolStructureParamsSchema = z.object({
  behavioralMapProtocolId: z.coerce.number().int().positive(),
});

export type FetchBehavioralMapProtocolStructureParams = z.infer<
  typeof fetchBehavioralMapProtocolStructureParamsSchema
>;

export const getBehavioralMapProtocolStructure = async ({
  behavioralMapProtocolId,
}: FetchBehavioralMapProtocolStructureParams) => {
  const behavioralMapProtocol = await prisma.behavioralMapProtocol.findUnique({
    where: { id: behavioralMapProtocolId },
    select: {
      id: true,
      name: true,
      archived: true,
      finalized: true,
      form: { select: { id: true, name: true } },
      behavioralMapProtocolGroups: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          position: true,
          personCharacteristicGroup: {
            select: { id: true, title: true, isTagGroup: true },
          },
          characteristics: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              position: true,
              personCharacteristic: {
                select: { id: true, name: true, iconKey: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  if (!behavioralMapProtocol) {
    throw new Error("Protocolo de mapa comportamental não encontrado");
  }

  return behavioralMapProtocol;
};

export const fetchBehavioralMapProtocolStructure = async (
  request: APIRequestParams<FetchBehavioralMapProtocolStructureParams>,
) => {
  const params = request.params!;
  try {
    const behavioralMapProtocol =
      await getBehavioralMapProtocolStructure(params);
    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { behavioralMapProtocol },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar protocolo de mapa comportamental!",
      } as APIResponseInfo,
      data: null,
    };
  }
};

export type FetchBehavioralMapProtocolStructureResponse = NonNullable<
  Awaited<ReturnType<typeof fetchBehavioralMapProtocolStructure>>["data"]
>;
