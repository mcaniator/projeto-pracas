import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchLocationTypes = (
  params?: UseFetchAPIParams<FetchLocationTypesResponse>,
) => {
  const url = "/api/admin/locationTypes";

  return useFetchAPI<FetchLocationTypesResponse>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["locationCategory", "database"] },
    },
  });
};
