import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type { FetchLocationCategoriesResponse } from "../queries/locationCategory";
import type {
  DeleteLocationCategoryOrTypeData,
  SaveLocationCategoryData,
} from "./locationCategoryParamsSchemas";

export type {
  DeleteLocationCategoryOrTypeData,
  SaveLocationCategoryData,
} from "./locationCategoryParamsSchemas";

export type DeleteLocationCategoryOrTypeResponse = {
  conflictingItems: {
    cityId: number;
    cityName: string;
    locations: { name: string }[];
  }[];
} | null;

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

export const useSaveLocationCategory = (
  params?: UseFetchAPIParams<null>,
) => {
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
