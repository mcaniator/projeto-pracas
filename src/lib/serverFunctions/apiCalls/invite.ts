import type { FetchInvitesResponse } from "@/lib/serverFunctions/queries/invite";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type {
  CreateInviteData,
  DeleteInviteData,
} from "./inviteParamsSchemas";

export type { CreateInviteData, DeleteInviteData } from "./inviteParamsSchemas";

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

export const useCreateInvite = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, CreateInviteData>({
    url: "/api/admin/invite/create",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteInvite = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, DeleteInviteData>({
    url: "/api/admin/invite/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
