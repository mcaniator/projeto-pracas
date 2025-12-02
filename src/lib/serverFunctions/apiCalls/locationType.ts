import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";

import { fetchAPI } from "../../utils/apiCall";

export const _fetchLocationTypes = async () => {
  const url = "/api/admin/locationTypes";

  const response = await fetchAPI<FetchLocationTypesResponse>({
    url,
    options: {
      method: "GET",
      next: { tags: ["locationCategory", "database"] },
    },
  });

  return response;
};
