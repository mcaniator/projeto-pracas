import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  FetchMapAssessmentComparisonAssessmentDetailsParams,
  FetchMapAssessmentComparisonAssessmentDetailsResponse,
  FetchMapAssessmentComparisonCategoriesResponse,
  FetchMapAssessmentComparisonResultsParams,
  FetchMapAssessmentComparisonResultsResponse,
} from "../queries/mapAssessmentComparison";

export const useFetchMapAssessmentComparisonCategories = (
  params?: UseFetchAPIParams<FetchMapAssessmentComparisonCategoriesResponse>,
) => {
  return useFetchAPI<
    FetchMapAssessmentComparisonCategoriesResponse,
    Record<string, never>
  >({
    url: "/api/admin/mapAssessmentComparison/categories",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useFetchMapAssessmentComparisonResults = (
  params?: UseFetchAPIParams<FetchMapAssessmentComparisonResultsResponse>,
) => {
  return useFetchAPI<
    FetchMapAssessmentComparisonResultsResponse,
    FetchMapAssessmentComparisonResultsParams
  >({
    url: "/api/admin/mapAssessmentComparison/results",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useFetchMapAssessmentComparisonAssessmentDetails = (
  params?: UseFetchAPIParams<FetchMapAssessmentComparisonAssessmentDetailsResponse>,
) => {
  return useFetchAPI<
    FetchMapAssessmentComparisonAssessmentDetailsResponse,
    FetchMapAssessmentComparisonAssessmentDetailsParams
  >({
    url: "/api/admin/mapAssessmentComparison/assessmentDetails",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
