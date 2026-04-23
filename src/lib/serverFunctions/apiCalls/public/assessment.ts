import { PublicFetchPublicAssessmentTreeParams } from "@/app/api/public/publicAssessments/[assessmentId]/route";
import { PublicFetchPublicAssessmentsParams } from "@/app/api/public/publicAssessments/route";
import {
  PublicFetchPublicAssessmentTreeResponse,
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
