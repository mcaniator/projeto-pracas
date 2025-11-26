"use server";

import { prisma } from "@/lib/prisma";

import { APIResponseInfo } from "../../types/backendCalls/APIResponse";

type LocationCategories = Awaited<ReturnType<typeof fetchLocationCategories>>;

export type FetchLocationCategoriesResponse = NonNullable<
  Awaited<ReturnType<typeof fetchLocationCategories>>["data"]
>;

export const fetchLocationCategories = async () => {
  try {
    const locationCategories = await prisma.locationCategory.findMany();
    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      statusCode: 200,
      data: {
        categories: locationCategories,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
        message: "Erro ao buscar categorias de praças!",
      } as APIResponseInfo,
      data: {
        categories: [],
      },
    };
  }
};

export { type LocationCategories };
