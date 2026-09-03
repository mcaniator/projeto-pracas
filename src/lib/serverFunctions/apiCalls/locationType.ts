import { fetchAdminSQLiteLocationTypes } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/locationType";
import type { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type { SaveLocationTypeData } from "../mutations/locationType";

export const useFetchLocationTypes = (
  params?: UseFetchAPIParams<FetchLocationTypesResponse>,
) => {
  const url = "/api/admin/locationTypes";

  return useFetchAPI<FetchLocationTypesResponse>({
    url,
    callbacks: params?.callbacks,
    offlineFallback: fetchAdminSQLiteLocationTypes,
    options: {
      method: "GET",
    },
  });
};

export const useSaveLocationType = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, SaveLocationTypeData>({
    url: "/api/admin/locationTypes/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
