import { FetchInvitesResponse } from "@/lib/serverFunctions/queries/invite";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchInvites = (
  params?: UseFetchAPIParams<FetchInvitesResponse>,
) => {
  const url = "/api/admin/invite/invitesTable";

  return useFetchAPI<FetchInvitesResponse>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["invite", "database"] },
    },
  });
};
