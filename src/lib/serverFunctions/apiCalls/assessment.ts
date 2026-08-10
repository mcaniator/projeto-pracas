import {
  fetchAdminSQLiteAssessments,
  fetchAdminSQLiteAssessmentTree,
  fetchAdminSQLiteAssessmentUsers,
} from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import { useCallback } from "react";

import type {
  CreateAssessmentData,
  CreateAssessmentResponse,
  DeleteAssessmentData,
  UpdateAssessmentVisibilityData,
} from "../mutations/assessmentUtil";
import type {
  AddResponsesData,
  AddResponsesResponse,
} from "../mutations/responseUtil";
import type {
  FetchAssessmentTreeParams,
  FetchAssessmentTreeResponse,
  FetchAssessmentUsersResponse,
  FetchAssessmentsParams,
  FetchAssessmentsResponse,
  FetchPublicAssessmentsParams,
  FetchPublicAssessmentsResponse,
} from "../queries/assessment";
import type {
  UploadImageResponseData,
  UploadImageResponseParams,
} from "../storage/drive/assessment";

export const useFetchAssessments = (
  params?: UseFetchAPIParams<FetchAssessmentsResponse>,
) => {
  return useFetchAPI<FetchAssessmentsResponse, FetchAssessmentsParams>({
    url: "/api/admin/assessments",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
    offlineFallback: fetchAdminSQLiteAssessments,
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
    },
    offlineFallback: fetchAdminSQLiteAssessmentUsers,
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
  return useFetchAPI<
    AddResponsesResponse,
    Record<string, never>,
    AddResponsesData
  >({
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
    },
    offlineFallback: fetchAdminSQLiteAssessmentTree,
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
