import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { UseFetchAPIParams } from "../../types/backendCalls/APIResponse";
import { FetchCategoriesWithSubcategoriesReponse } from "../queries/category";

export const useFetchCategoriesWithSubcategories = (
  params?: UseFetchAPIParams<FetchCategoriesWithSubcategoriesReponse>,
) => {
  return useFetchAPI<FetchCategoriesWithSubcategoriesReponse>({
    url: "/api/admin/forms/categoriesWithSubcategories",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
