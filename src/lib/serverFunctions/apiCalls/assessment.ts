import { FetchAssessmentTreeParams } from "@/app/api/admin/assessments/[assessmentId]/route";
import { FetchPublicAssessmentsParams } from "@/app/api/admin/publicAssessments/route";
import type { UploadImageResponseParams } from "@/app/api/admin/uploadImageResponse/route";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";
import { useCallback } from "react";

import { FetchAssessmentsParams } from "../../../app/api/admin/assessments/route";
import { fetchAPI } from "../../utils/apiCall";
import {
  FetchAssessmentsResponse,
  FetchPublicAssessmentTreeResponse,
  FetchPublicAssessmentsResponse,
} from "../queries/assessment";
import type { UploadImageResponseData } from "../storage/drive/assessment";

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

export const useFetchPublicAssessmentTree = ({
  params,
}: {
  params?: UseFetchAPIParams<FetchPublicAssessmentTreeResponse>;
}) => {
  return useFetchAPI<
    FetchPublicAssessmentTreeResponse,
    FetchAssessmentTreeParams
  >({
    url: "/api/admin/assessments/:assessmentId",
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
      functionOptions?: Parameters<typeof uploadImageResponseFetch>[1],
    ) => {
      const formData = new FormData();
      //formData.append("folderId", folderId);
      formData.append("folderId", folderId);
      formData.append("image", image);

      return uploadImageResponseFetch(
        {},
        {
          ...functionOptions,
          body: formData,
        },
      );
    },
    [uploadImageResponseFetch],
  );

  return [uploadImageResponse, isLoading] as const;
};
