import type {
  PublicFetchPublicAssessmentTreeResponse,
  PublicFetchPublicAssessmentsResponse,
} from "@/lib/serverFunctions/queries/public/assessment";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import type {
  PublicFetchPublicAssessmentTreeParams,
  PublicFetchPublicAssessmentsParams,
} from "./assessmentParamsSchemas";

export type {
  PublicFetchPublicAssessmentTreeParams,
  PublicFetchPublicAssessmentsParams,
} from "./assessmentParamsSchemas";

export const usePublicFetchPublicAssessments = (
  params?: UseFetchAPIParams<PublicFetchPublicAssessmentsResponse>,
) => {
  return useFetchAPI<
    PublicFetchPublicAssessmentsResponse,
    PublicFetchPublicAssessmentsParams
  >({
    url: "/api/public/publicAssessments",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};

export const usePublicFetchPublicAssessmentTree = ({
  params,
}: {
  params?: UseFetchAPIParams<PublicFetchPublicAssessmentTreeResponse>;
}) => {
  return useFetchAPI<
    PublicFetchPublicAssessmentTreeResponse,
    PublicFetchPublicAssessmentTreeParams
  >({
    url: "/api/public/publicAssessments/:assessmentId",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};
