import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { FetchCitiesParams } from "../../../app/api/admin/cities/route";
import { FetchCitiesResponse } from "../queries/city";

export const useFetchCities = (
  params?: UseFetchAPIParams<FetchCitiesResponse>,
) => {
  const url = "/api/admin/cities";

  return useFetchAPI<FetchCitiesResponse, FetchCitiesParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["city", "database"] },
    },
  });
};
