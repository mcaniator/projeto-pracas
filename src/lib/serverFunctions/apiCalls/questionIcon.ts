import type {
  FetchDynamicIconsParams,
  FetchDynamicIconsResponse,
} from "@/lib/serverFunctions/queries/questionIcon";
import type { CreateDynamicIconData } from "@/lib/serverFunctions/mutations/questionIcon";
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

const useCreateDynamicIcon = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, CreateDynamicIconData>({
    url: "/api/admin/forms/dynamicIcons/create",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export { useCreateDynamicIcon, useFetchDynamicIcons };
