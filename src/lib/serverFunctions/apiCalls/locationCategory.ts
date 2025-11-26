import { fetchAPI } from "../../utils/apiCall";
import { FetchLocationCategoriesResponse } from "../queries/locationCategory";

export const _fetchLocationCategories = async () => {
  const url = "/api/admin/locationCategories";

  const response = await fetchAPI<FetchLocationCategoriesResponse>({
    url,
    options: {
      method: "GET",
      next: { tags: ["locationCategory", "database"] },
    },
  });

  return response;
};
