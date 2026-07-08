import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  FetchMapAssessmentComparisonAssessmentTreesResponse,
  FetchMapAssessmentComparisonCategoriesResponse,
  FetchMapAssessmentComparisonResultsResponse,
} from "../queries/mapAssessmentComparison";
import type {
  FetchMapAssessmentComparisonAssessmentTreesParams,
  FetchMapAssessmentComparisonResultsParams,
} from "./mapAssessmentComparisonParamsSchemas";

export type {
  FetchMapAssessmentComparisonAssessmentTreesParams,
  FetchMapAssessmentComparisonResultsParams,
} from "./mapAssessmentComparisonParamsSchemas";

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
      next: { tags: ["assessment", "database"] },
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
      next: { tags: ["assessment", "database"] },
    },
  });
};

export const useFetchMapAssessmentComparisonAssessmentTrees = (
  params?: UseFetchAPIParams<FetchMapAssessmentComparisonAssessmentTreesResponse>,
) => {
  return useFetchAPI<
    FetchMapAssessmentComparisonAssessmentTreesResponse,
    FetchMapAssessmentComparisonAssessmentTreesParams
  >({
    url: "/api/admin/mapAssessmentComparison/assessmentTrees",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};
