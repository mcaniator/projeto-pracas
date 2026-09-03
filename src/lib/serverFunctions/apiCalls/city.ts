import { fetchAdminSqliteCities } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/city";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  DeleteCityData,
  DeleteCityResponse,
  SaveCityData,
} from "../mutations/city";
import type { FetchCitiesParams, FetchCitiesResponse } from "../queries/city";
import type {
  PublicFetchCitiesParams,
  PublicFetchCitiesResponse,
} from "../queries/public/city";

export const useFetchCities = (
  params?: UseFetchAPIParams<FetchCitiesResponse>,
) => {
  const url = "/api/admin/cities";

  return useFetchAPI<FetchCitiesResponse, FetchCitiesParams>({
    url,
    callbacks: params?.callbacks,
    offlineFallback: fetchAdminSqliteCities,
    options: {
      method: "GET",
    },
  });
};

export const usePublicFetchCities = (
  params?: UseFetchAPIParams<PublicFetchCitiesResponse>,
) => {
  const url = "/api/public/cities";

  return useFetchAPI<PublicFetchCitiesResponse, PublicFetchCitiesParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
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

export const useDeleteCity = (
  params?: UseFetchAPIParams<DeleteCityResponse>,
) => {
  return useFetchAPI<DeleteCityResponse, Record<string, never>, DeleteCityData>(
    {
      url: "/api/admin/cities/delete",
      callbacks: params?.callbacks,
      options: {
        method: "POST",
      },
    },
  );
};
