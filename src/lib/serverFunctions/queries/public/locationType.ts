import { prisma } from "@/lib/prisma";
import {
  APIRequestParams,
  APIResponseInfo,
} from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

export const publicFetchLocationTypesParamsSchema = z.object({
  cityId: z.coerce.number(),
});

export type PublicFetchLocationTypesParams = z.infer<
  typeof publicFetchLocationTypesParamsSchema
>;

export type PublicFetchLocationTypesResponse = Awaited<
  ReturnType<typeof publicFetchLocationTypes>
>["data"];

export const publicFetchLocationTypes = async (
  request: APIRequestParams<PublicFetchLocationTypesParams>,
) => {
  const params = request.params!;
  try {
    const types = await prisma.locationType.findMany({
      where: {
        locations: {
          some: {
            isPublic: true,
            cityId: params.cityId,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        types,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar tipos de praças!",
      } as APIResponseInfo,
      data: {
        types: [],
      },
    };
  }
};
