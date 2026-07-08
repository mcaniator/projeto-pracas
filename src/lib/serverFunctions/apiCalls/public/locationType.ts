import type { PublicFetchLocationTypesResponse } from "@/lib/serverFunctions/queries/public/locationType";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type { PublicFetchLocationTypesParams } from "./locationTypeParamsSchemas";

export type { PublicFetchLocationTypesParams } from "./locationTypeParamsSchemas";

export const usePublicFetchLocationTypes = (
  params?: UseFetchAPIParams<PublicFetchLocationTypesResponse>,
) => {
  const url = "/api/public/locationTypes";
  return useFetchAPI<
    PublicFetchLocationTypesResponse,
    PublicFetchLocationTypesParams
  >({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["locationType", "database"] },
    },
  });
};
