import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { prisma } from "@lib/prisma";
import { z } from "zod";

export const fetchPersonCharacteristicGroupsParamsSchema = z.object({
  search: z.string().trim().max(255).optional().nullish(),
  personCharacteristicGroupId: z.coerce.number().int().optional().nullish(),
});

export type FetchPersonCharacteristicGroupsParams = z.infer<
  typeof fetchPersonCharacteristicGroupsParamsSchema
>;

export type FetchPersonCharacteristicGroupsResponse = Awaited<
  ReturnType<typeof fetchPersonCharacteristicGroups>
>["data"];

export const fetchPersonCharacteristicGroups = async (
  request: APIRequestParams<FetchPersonCharacteristicGroupsParams>,
) => {
  const params = request.params!;
  const search = params.search?.trim();
  const personCharacteristicGroupId = params.personCharacteristicGroupId;

  try {
    const personCharacteristicGroups =
      await prisma.personCharacteristicGroup.findMany({
        where: {
          ...(personCharacteristicGroupId ?
            { id: personCharacteristicGroupId }
          : {}),
          ...(search ?
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
        },
        select: {
          id: true,
          title: true,
          isTagGroup: true,
          personCharacteristics: {
            select: {
              id: true,
              name: true,
              iconKey: true,
              color: true,
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { title: "asc" },
      });

    return {
      responseInfo: { statusCode: 200 } as APIResponseInfo,
      data: { personCharacteristicGroups },
    };
  } catch {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao consultar grupos de características!",
      } as APIResponseInfo,
      data: { personCharacteristicGroups: [] },
    };
  }
};
