import type { FetchUsersResponse } from "@/lib/serverFunctions/queries/user";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type {
  UpdateUserArchiveData,
  UpdateUserRolesData,
} from "./userParamsSchemas";

export type {
  UpdateUserArchiveData,
  UpdateUserRolesData,
} from "./userParamsSchemas";

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

export const useUpdateUserRoles = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, UpdateUserRolesData>({
    url: "/api/admin/users/roles",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useUpdateUserArchive = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, UpdateUserArchiveData>({
    url: "/api/admin/users/archive",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
