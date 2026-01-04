import { FetchFormParams } from "@/app/api/admin/forms/route";
import { FetchFormsResponse } from "@/lib/serverFunctions/queries/form";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchForms = (
  params?: UseFetchAPIParams<FetchFormsResponse>,
) => {
  const url = "/api/admin/forms";

  return useFetchAPI<FetchFormsResponse, FetchFormParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["form", "database"] },
    },
  });
};
