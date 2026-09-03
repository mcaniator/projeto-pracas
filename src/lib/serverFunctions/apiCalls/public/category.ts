import type {
  PublicFetchCategoriesParams,
  PublicFetchCategoriesResponse,
} from "@/lib/serverFunctions/queries/public/category";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const usePublicFetchLocationCategories = (
  params?: UseFetchAPIParams<PublicFetchCategoriesResponse>,
) => {
  const url = "/api/public/locationCategories";
  return useFetchAPI<
    PublicFetchCategoriesResponse,
    PublicFetchCategoriesParams
  >({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
