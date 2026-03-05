import { PublicFetchLocationTypesParams } from "@/app/api/public/locationTypes/route";
import { PublicFetchLocationTypesResponse } from "@/lib/serverFunctions/queries/public/locationType";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

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
