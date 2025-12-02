import { FetchCitiesParams } from "../../../app/api/admin/cities/route";
import { fetchAPI } from "../../utils/apiCall";
import { FetchCitiesResponse } from "../queries/city";

export const _fetchCities = async (params: FetchCitiesParams) => {
  const url = "/api/admin/cities";

  const response = await fetchAPI<FetchCitiesResponse>({
    url,
    params,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });

  return response;
};
