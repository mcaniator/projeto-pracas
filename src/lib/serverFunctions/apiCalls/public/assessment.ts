import type {
  PublicFetchPublicAssessmentDetailsParams,
  PublicFetchPublicAssessmentDetailsResponse,
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

export const usePublicFetchPublicAssessmentDetails = ({
  params,
}: {
  params?: UseFetchAPIParams<PublicFetchPublicAssessmentDetailsResponse>;
}) => {
  return useFetchAPI<
    PublicFetchPublicAssessmentDetailsResponse,
    PublicFetchPublicAssessmentDetailsParams
  >({
    url: "/api/public/publicAssessment",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
