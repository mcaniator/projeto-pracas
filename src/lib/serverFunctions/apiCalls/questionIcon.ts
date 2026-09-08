import type {
  DeleteCustomDynamicIconData,
  DeleteCustomDynamicIconResponse,
  SaveCustomDynamicIconData,
} from "@/lib/serverFunctions/mutations/questionIcon";
import type {
  FetchCustomDynamicIconDetailsParams,
  FetchCustomDynamicIconDetailsResponse,
  FetchDynamicIconsParams,
  FetchDynamicIconsResponse,
} from "@/lib/serverFunctions/queries/questionIcon";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

const useFetchDynamicIcons = (
  params?: UseFetchAPIParams<FetchDynamicIconsResponse>,
) => {
  const url = "/api/admin/forms/dynamicIcons";

  return useFetchAPI<FetchDynamicIconsResponse, FetchDynamicIconsParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

const useFetchCustomDynamicIconDetails = (
  params?: UseFetchAPIParams<FetchCustomDynamicIconDetailsResponse>,
) => {
  return useFetchAPI<
    FetchCustomDynamicIconDetailsResponse,
    FetchCustomDynamicIconDetailsParams
  >({
    url: "/api/admin/forms/dynamicIcons/details",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

const useSaveCustomDynamicIcon = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, SaveCustomDynamicIconData>({
    url: "/api/admin/forms/dynamicIcons/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

const useDeleteCustomDynamicIcon = (
  params?: UseFetchAPIParams<DeleteCustomDynamicIconResponse>,
) => {
  return useFetchAPI<
    DeleteCustomDynamicIconResponse,
    Record<string, never>,
    DeleteCustomDynamicIconData
  >({
    url: "/api/admin/forms/dynamicIcons/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export {
  useDeleteCustomDynamicIcon,
  useFetchCustomDynamicIconDetails,
  useSaveCustomDynamicIcon,
  useFetchDynamicIcons,
};
