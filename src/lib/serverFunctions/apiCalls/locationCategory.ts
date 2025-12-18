import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { FetchLocationCategoriesResponse } from "../queries/locationCategory";

export const useFetchLocationCategories = () => {
  const url = "/api/admin/locationCategories";

  return useFetchAPI<FetchLocationCategoriesResponse>({
    url,
    options: {
      method: "GET",
      next: { tags: ["locationCategory", "database"] },
    },
  });
};
