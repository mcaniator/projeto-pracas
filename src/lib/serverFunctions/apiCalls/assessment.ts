import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import { useCallback } from "react";

import { fetchAPI } from "../../utils/apiCall";
import type {
  AddResponsesData,
  CreateAssessmentData,
  DeleteAssessmentData,
  FetchAssessmentsParams,
  FetchAssessmentTreeParams,
  FetchPublicAssessmentsParams,
  UpdateAssessmentVisibilityData,
  UploadImageResponseParams,
} from "./assessmentParamsSchemas";
import type {
  FetchAssessmentTreeResponse,
  FetchAssessmentsResponse,
  FetchPublicAssessmentsResponse,
} from "../queries/assessment";
import type { UploadImageResponseData } from "../storage/drive/assessment";

export type {
  AddResponsesData,
  CreateAssessmentData,
  DeleteAssessmentData,
  FetchAssessmentsParams,
  FetchAssessmentTreeParams,
  FetchPublicAssessmentsParams,
  UpdateAssessmentVisibilityData,
  UploadImageResponseParams,
} from "./assessmentParamsSchemas";

export type FetchAssessmentUsersResponse = {
  users: { id: string; username: string }[];
};

export type CreateAssessmentResponse = {
  assessmentId: number;
};

export type AddResponsesResponse = {
  savedAsFinalized: boolean;
  updatedAt: string;
};

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

export const useFetchAssessmentUsers = (
  params?: UseFetchAPIParams<FetchAssessmentUsersResponse>,
) => {
  return useFetchAPI<FetchAssessmentUsersResponse, Record<string, never>>({
    url: "/api/admin/assessments/users",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "user", "database"] },
    },
  });
};

export const useCreateAssessment = (
  params?: UseFetchAPIParams<CreateAssessmentResponse>,
) => {
  return useFetchAPI<
    CreateAssessmentResponse,
    Record<string, never>,
    CreateAssessmentData
  >({
    url: "/api/admin/assessments/create",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteAssessment = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, DeleteAssessmentData>({
    url: "/api/admin/assessments/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useUpdateAssessmentVisibility = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    UpdateAssessmentVisibilityData
  >({
    url: "/api/admin/assessments/visibility",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useAddResponses = (
  params?: UseFetchAPIParams<AddResponsesResponse>,
) => {
  return useFetchAPI<AddResponsesResponse, Record<string, never>, AddResponsesData>({
    url: "/api/admin/assessments/responses",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
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

export const useFetchPublicAssessmentTree = ({
  params,
}: {
  params?: UseFetchAPIParams<FetchAssessmentTreeResponse>;
}) => {
  return useFetchAPI<FetchAssessmentTreeResponse, FetchAssessmentTreeParams>({
    url: "/api/admin/assessments/public/:assessmentId",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["assessment", "database"] },
    },
  });
};

export const useUploadImageResponse = (
  params?: UseFetchAPIParams<UploadImageResponseData>,
) => {
  const [uploadImageResponseFetch, isLoading] = useFetchAPI<
    UploadImageResponseData,
    Record<string, never>
  >({
    url: "/api/admin/uploadImageResponse",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });

  const uploadImageResponse = useCallback(
    (
      { folderId, image }: UploadImageResponseParams,
      projectOptions?: NonNullable<
        Parameters<typeof uploadImageResponseFetch>[0]
      >["projectOptions"],
    ) => {
      const formData = new FormData();
      //formData.append("folderId", folderId);
      formData.append("folderId", folderId);
      formData.append("image", image);

      return uploadImageResponseFetch({
        data: formData,
        projectOptions,
      });
    },
    [uploadImageResponseFetch],
  );

  return [uploadImageResponse, isLoading] as const;
};
