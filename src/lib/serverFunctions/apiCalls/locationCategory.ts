import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { FetchLocationCategoriesResponse } from "../queries/locationCategory";

export const useFetchLocationCategories = (
  params?: UseFetchAPIParams<FetchLocationCategoriesResponse>,
) => {
  const url = "/api/admin/locationCategories";

  return useFetchAPI<FetchLocationCategoriesResponse>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["locationCategory", "database"] },
    },
  });
};
