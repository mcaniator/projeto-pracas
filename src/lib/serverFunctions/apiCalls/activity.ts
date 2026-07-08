import type { FetchRecentlyCompletedAssessmentsResponse } from "@/lib/serverFunctions/queries/assessment";
import type { FetchRecentlyCompletedTallyResponse } from "@/lib/serverFunctions/queries/tally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export type FetchRecentActivityResponse = {
  assessments: FetchRecentlyCompletedAssessmentsResponse["assessments"];
  tallys: FetchRecentlyCompletedTallyResponse["tallys"];
};

export const useFetchRecentActivity = (
  params?: UseFetchAPIParams<FetchRecentActivityResponse>,
) => {
  return useFetchAPI<FetchRecentActivityResponse, Record<string, never>>({
    url: "/api/admin/activity/recent",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "tally", "database"] },
    },
  });
};
