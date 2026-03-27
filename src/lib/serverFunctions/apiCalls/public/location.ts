import { FetchLocationsParams } from "@/app/api/admin/locations/route";
import { PublicFetchLocationsResponse } from "@/lib/serverFunctions/queries/public/location";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const usePublicFetchLocations = (
  params?: UseFetchAPIParams<PublicFetchLocationsResponse>,
) => {
  const url = `/api/public/locations`;

  return useFetchAPI<PublicFetchLocationsResponse, FetchLocationsParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["location", "database"] },
    },
  });
};
