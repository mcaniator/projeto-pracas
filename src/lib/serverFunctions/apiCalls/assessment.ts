import { FetchAssessmentTreeParams } from "@/app/api/admin/assessments/[assessmentId]/route";
import { FetchPublicAssessmentsParams } from "@/app/api/admin/publicAssessments/route";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import { FetchAssessmentsParams } from "../../../app/api/admin/assessments/route";
import { fetchAPI } from "../../utils/apiCall";
import {
  FetchAssessmentTreeResponse,
  FetchAssessmentsResponse,
  FetchPublicAssessmentsResponse,
} from "../queries/assessment";

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

export const useFetchPublicAssessments = (
  params?: UseFetchAPIParams<FetchPublicAssessmentsResponse>,
) => {
  return useFetchAPI<
    FetchPublicAssessmentsResponse,
    FetchPublicAssessmentsParams
  >({
    url: "/api/admin/publicAssessments",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};

export const useFetchAssessmentTree = ({
  params,
}: {
  params?: UseFetchAPIParams<FetchAssessmentTreeResponse>;
}) => {
  return useFetchAPI<FetchAssessmentTreeResponse, FetchAssessmentTreeParams>({
    url: "/api/admin/assessments/:assessmentId",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};
