import { fetchAdminSQLiteLocations } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/location";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  CreateLocationData,
  DeleteLocationData,
  EditLocationPolygonData,
  UpdateLocationData,
  UpdateLocationVisibilityData,
} from "../mutations/locationUtil";
import type {
  FetchLocationsParams,
  FetchLocationsResponse,
} from "../queries/location";

export const useFetchLocations = (
  params?: UseFetchAPIParams<FetchLocationsResponse>,
) => {
  const url = `/api/admin/locations`;

  return useFetchAPI<FetchLocationsResponse, FetchLocationsParams>({
    url,
    callbacks: params?.callbacks,
    offlineFallback: fetchAdminSQLiteLocations,
    options: {
      method: "GET",
    },
  });
};

export const useCreateLocation = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, CreateLocationData>({
    url: "/api/admin/locations/create",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useUpdateLocation = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, UpdateLocationData>({
    url: "/api/admin/locations/update",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteLocation = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, DeleteLocationData>({
    url: "/api/admin/locations/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useUpdateLocationVisibility = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<null, Record<string, never>, UpdateLocationVisibilityData>(
    {
      url: "/api/admin/locations/visibility",
      callbacks: params?.callbacks,
      options: {
        method: "POST",
      },
    },
  );
};

export const useEditLocationPolygon = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, EditLocationPolygonData>({
    url: "/api/admin/locations/polygon",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
