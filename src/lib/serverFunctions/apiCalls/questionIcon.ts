import type {
  FetchDynamicIconsParams,
  FetchDynamicIconsResponse,
} from "@/lib/serverFunctions/queries/questionIcon";
import type { SaveCustomDynamicIconData } from "@/lib/serverFunctions/mutations/questionIcon";
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

const useSaveCustomDynamicIcon = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    SaveCustomDynamicIconData
  >({
    url: "/api/admin/forms/dynamicIcons/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export { useSaveCustomDynamicIcon, useFetchDynamicIcons };
