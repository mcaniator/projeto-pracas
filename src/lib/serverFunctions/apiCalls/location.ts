import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { FetchLocationsParams } from "../../../app/api/admin/locations/route";
import { FetchLocationsResponse } from "../queries/location";

export const useFetchLocations = (
  params?: UseFetchAPIParams<FetchLocationsResponse>,
) => {
  const url = `/api/admin/locations`;

  return useFetchAPI<FetchLocationsResponse, FetchLocationsParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["location", "database"] },
    },
  });
};
