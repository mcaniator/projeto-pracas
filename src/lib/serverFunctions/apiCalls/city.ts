import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type { FetchCitiesResponse } from "../queries/city";
import type {
  DeleteCityData,
  FetchCitiesParams,
  SaveCityData,
} from "./cityParamsSchemas";
import type { PublicFetchCitiesParams } from "./public/cityParamsSchemas";

export type {
  DeleteCityData,
  FetchCitiesParams,
  SaveCityData,
} from "./cityParamsSchemas";
export type { PublicFetchCitiesParams } from "./public/cityParamsSchemas";

export const useFetchCities = (
  params?: UseFetchAPIParams<FetchCitiesResponse>,
) => {
  const url = "/api/admin/cities";

  return useFetchAPI<FetchCitiesResponse, FetchCitiesParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["city", "database"] },
    },
  });
};

export const usePublicFetchCities = (
  params?: UseFetchAPIParams<FetchCitiesResponse>,
) => {
  const url = "/api/public/cities";

  return useFetchAPI<FetchCitiesResponse, PublicFetchCitiesParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["city", "database"] },
    },
  });
};

export const useSaveCity = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, SaveCityData>({
    url: "/api/admin/cities/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export type DeleteCityResponse = {
  numberOfLocations: number;
} | null;

export const useDeleteCity = (
  params?: UseFetchAPIParams<DeleteCityResponse>,
) => {
  return useFetchAPI<DeleteCityResponse, Record<string, never>, DeleteCityData>({
    url: "/api/admin/cities/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
