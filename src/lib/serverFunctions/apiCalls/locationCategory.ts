import { fetchAdminSQLiteLocationCategories } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/locationCategory";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  DeleteLocationCategoryOrTypeData,
  DeleteLocationCategoryOrTypeResponse,
  SaveLocationCategoryData,
} from "../mutations/locationCategory";
import type { FetchLocationCategoriesResponse } from "../queries/locationCategory";

export const useFetchLocationCategories = (
  params?: UseFetchAPIParams<FetchLocationCategoriesResponse>,
) => {
  const url = "/api/admin/locationCategories";

  return useFetchAPI<FetchLocationCategoriesResponse>({
    url,
    callbacks: params?.callbacks,
    offlineFallback: fetchAdminSQLiteLocationCategories,
    options: {
      method: "GET",
    },
  });
};

export const useSaveLocationCategory = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, SaveLocationCategoryData>({
    url: "/api/admin/locationCategories/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteLocationCategoryOrType = (
  params?: UseFetchAPIParams<DeleteLocationCategoryOrTypeResponse>,
) => {
  return useFetchAPI<
    DeleteLocationCategoryOrTypeResponse,
    Record<string, never>,
    DeleteLocationCategoryOrTypeData
  >({
    url: "/api/admin/locationCategories/deleteCategoryOrType",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
