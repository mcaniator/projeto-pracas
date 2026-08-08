import type {
  PublicFetchPublicAssessmentTreeParams,
  PublicFetchPublicAssessmentTreeResponse,
  PublicFetchPublicAssessmentsParams,
  PublicFetchPublicAssessmentsResponse,
} from "@/lib/serverFunctions/queries/public/assessment";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

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
    },
  });
};
