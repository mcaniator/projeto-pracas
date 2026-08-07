import type { FetchRecentActivityResponse } from "@/lib/serverFunctions/queries/activity";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchRecentActivity = (
  params?: UseFetchAPIParams<FetchRecentActivityResponse>,
) => {
  return useFetchAPI<FetchRecentActivityResponse, Record<string, never>>({
    url: "/api/admin/activity/recent",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
