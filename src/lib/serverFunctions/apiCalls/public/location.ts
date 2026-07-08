import type { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type { PublicFetchLocationsParams } from "./locationParamsSchemas";

export type { PublicFetchLocationsParams } from "./locationParamsSchemas";

export const usePublicFetchLocations = (
  params?: UseFetchAPIParams<PublicFetchLocationsResponse>,
) => {
  const url = `/api/public/locations`;

  return useFetchAPI<PublicFetchLocationsResponse, PublicFetchLocationsParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["location", "database"] },
    },
  });
};
