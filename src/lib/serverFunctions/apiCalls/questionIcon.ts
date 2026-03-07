import { FetchQuestionIconsParams } from "@/app/api/admin/forms/questionIcons/route";
import { FetchQuestionIconsResponse } from "@/lib/serverFunctions/queries/questionIcon";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

const useFetchQuestionIcons = (
  params?: UseFetchAPIParams<FetchQuestionIconsResponse>,
) => {
  const url = "/api/admin/forms/questionIcons";

  return useFetchAPI<FetchQuestionIconsResponse, FetchQuestionIconsParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["question", "database"] },
    },
  });
};

export { useFetchQuestionIcons };
