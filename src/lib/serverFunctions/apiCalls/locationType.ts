import type { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type { SaveLocationTypeData } from "./locationTypeParamsSchemas";

export type { SaveLocationTypeData } from "./locationTypeParamsSchemas";

export const useFetchLocationTypes = (
  params?: UseFetchAPIParams<FetchLocationTypesResponse>,
) => {
  const url = "/api/admin/locationTypes";

  return useFetchAPI<FetchLocationTypesResponse>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["locationCategory", "database"] },
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
