import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type { FetchLocationsResponse } from "../queries/location";
import type {
  CreateLocationData,
  DeleteLocationData,
  EditLocationPolygonData,
  FetchLocationsParams,
  UpdateLocationData,
  UpdateLocationVisibilityData,
} from "./locationParamsSchemas";

export type {
  CreateLocationData,
  DeleteLocationData,
  EditLocationPolygonData,
  FetchLocationsParams,
  UpdateLocationData,
  UpdateLocationVisibilityData,
} from "./locationParamsSchemas";

export const useFetchLocations = (
  params?: UseFetchAPIParams<FetchLocationsResponse>,
) => {
  const url = `/api/admin/locations`;

  return useFetchAPI<FetchLocationsResponse, FetchLocationsParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["location", "database"] },
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
  return useFetchAPI<null, Record<string, never>, UpdateLocationVisibilityData>({
    url: "/api/admin/locations/visibility",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
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
