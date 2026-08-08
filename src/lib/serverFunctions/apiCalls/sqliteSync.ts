import type {
  FetchSQLiteSyncDataResponse,
  SQLiteSyncParams,
} from "@/lib/serverFunctions/queries/sqliteSync";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchSQLiteSyncData = (
  params?: UseFetchAPIParams<FetchSQLiteSyncDataResponse>,
) => {
  const url = "/api/admin/sqliteSync";

  return useFetchAPI<FetchSQLiteSyncDataResponse, SQLiteSyncParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
