import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { FetchAssessmentsParams } from "../../../app/api/admin/assessments/route";
import { fetchAPI } from "../../utils/apiCall";
import { FetchAssessmentsResponse } from "../queries/assessment";

export const _fetchAssessments = async (params: FetchAssessmentsParams) => {
  const url = `/api/admin/assessments`;

  const response = await fetchAPI<FetchAssessmentsResponse>({
    url,
    params,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });

  return response;
};

export const useFetchAssessments = (
  params?: UseFetchAPIParams<FetchAssessmentsResponse>,
) => {
  return useFetchAPI<FetchAssessmentsResponse, FetchAssessmentsParams>({
    url: "/api/admin/assessments",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};
