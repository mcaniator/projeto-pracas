import { PublicFetchTallysParams } from "@/app/api/public/tallys/route";
import { PublicFetchTallysResponse } from "@/lib/serverFunctions/queries/public/tally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const usePublicFetchTallys = (
  params?: UseFetchAPIParams<PublicFetchTallysResponse>,
) => {
  const url = `/api/public/tallys`;

  return useFetchAPI<PublicFetchTallysResponse, PublicFetchTallysParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["tally", "database"] },
    },
  });
};
