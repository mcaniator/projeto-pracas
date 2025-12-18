import { FetchLocationTypesResponse } from "@/lib/serverFunctions/queries/locationType";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchLocationTypes = () => {
  const url = "/api/admin/locationTypes";

  return useFetchAPI<FetchLocationTypesResponse>({
    url,
    options: {
      method: "GET",
      next: { tags: ["locationCategory", "database"] },
    },
  });
};
