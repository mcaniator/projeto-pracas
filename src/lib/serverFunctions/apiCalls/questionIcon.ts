import { FetchDynamicIconsParams } from "@/app/api/admin/forms/dynamicIcons/route";
import { FetchDynamicIconsResponse } from "@/lib/serverFunctions/queries/questionIcon";
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
      next: { tags: ["question", "database"] },
    },
  });
};

export { useFetchDynamicIcons };
