import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { FetchCitiesParams } from "../../../app/api/admin/cities/route";
import { FetchCitiesResponse } from "../queries/city";

export const useFetchCities = (params: FetchCitiesParams) => {
  const url = "/api/admin/cities";

  return useFetchAPI<FetchCitiesResponse>({
    url,
    params,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};
