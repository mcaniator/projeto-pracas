import { prisma } from "@/lib/prisma";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";

type LocationTypes = Awaited<ReturnType<typeof fetchLocationTypes>>;

export type FetchLocationTypesResponse = NonNullable<
  Awaited<ReturnType<typeof fetchLocationTypes>>["data"]
>;

export const fetchLocationTypes = async () => {
  try {
    const locationTypes = await prisma.locationType.findMany();
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        types: locationTypes,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar categorias de praças!",
      } as APIResponseInfo,
      data: {
        types: [],
      },
    };
  }
};

export { type LocationTypes };
