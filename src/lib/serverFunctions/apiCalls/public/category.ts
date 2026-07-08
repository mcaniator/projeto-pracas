import type { PublicFetchCategoriesResponse } from "@/lib/serverFunctions/queries/public/category";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type { PublicFetchCategoriesParams } from "./categoryParamsSchemas";

export type { PublicFetchCategoriesParams } from "./categoryParamsSchemas";

export const usePublicFetchLocationCategories = (
  params?: UseFetchAPIParams<PublicFetchCategoriesResponse>,
) => {
  const url = "/api/public/locationCategories";
  return useFetchAPI<
    PublicFetchCategoriesResponse,
    PublicFetchCategoriesParams
  >({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["category", "database"] },
    },
  });
};
