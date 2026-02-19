import { FetchUsersResponse } from "@/lib/serverFunctions/queries/user";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchUsers = (
  params?: UseFetchAPIParams<FetchUsersResponse>,
) => {
  const url = "/api/admin/users/usersTable";
  return useFetchAPI<FetchUsersResponse>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["user", "database"] },
    },
  });
};
