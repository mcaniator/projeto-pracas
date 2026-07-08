import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { UseFetchAPIParams } from "../../types/backendCalls/APIResponse";
import type { FetchCategoriesWithSubcategoriesReponse } from "../queries/category";
import type {
  CategorySubmitData,
  DeleteCategoryData,
  DeleteSubcategoryData,
  SubcategorySubmitData,
} from "./categoryParamsSchemas";

export type {
  CategorySubmitData,
  DeleteCategoryData,
  DeleteSubcategoryData,
  SubcategorySubmitData,
} from "./categoryParamsSchemas";

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

export const useCategorySubmit = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, CategorySubmitData>({
    url: "/api/admin/forms/fieldsCreation/category/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useSubcategorySubmit = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, SubcategorySubmitData>({
    url: "/api/admin/forms/fieldsCreation/subcategory/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteCategory = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, DeleteCategoryData>({
    url: "/api/admin/forms/fieldsCreation/category/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteSubcategory = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, DeleteSubcategoryData>({
    url: "/api/admin/forms/fieldsCreation/subcategory/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
