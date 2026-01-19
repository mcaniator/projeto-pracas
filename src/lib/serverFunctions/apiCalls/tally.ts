import { FetchTallysParams } from "@/app/api/admin/tallys/route";
import { FetchTallysResponse } from "@/lib/serverFunctions/queries/tally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchTallys = (
  params?: UseFetchAPIParams<FetchTallysResponse>,
) => {
  const url = `/api/admin/tallys`;

  return useFetchAPI<FetchTallysResponse, FetchTallysParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["tally", "database"] },
    },
  });
};
