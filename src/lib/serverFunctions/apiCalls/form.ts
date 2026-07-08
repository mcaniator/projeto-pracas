import type {
  FetchFormEditorResponse,
  FetchFormsResponse,
} from "@/lib/serverFunctions/queries/form";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  CreateFormData,
  FetchFormEditorParams,
  FetchFormParams,
  UpdateFormArchiveStatusData,
  UpdateFormData,
} from "./formParamsSchemas";

export type {
  CreateFormData,
  FetchFormEditorParams,
  FetchFormParams,
  UpdateFormArchiveStatusData,
  UpdateFormData,
} from "./formParamsSchemas";

export const useFetchForms = (
  params?: UseFetchAPIParams<FetchFormsResponse>,
) => {
  const url = "/api/admin/forms";

  return useFetchAPI<FetchFormsResponse, FetchFormParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["form", "database"] },
    },
  });
};

export const useFetchFormEditor = (
  params?: UseFetchAPIParams<FetchFormEditorResponse>,
) => {
  return useFetchAPI<FetchFormEditorResponse, FetchFormEditorParams>({
    url: "/api/admin/forms/editor",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
      next: { tags: ["form", "database"] },
    },
  });
};

export const useCreateForm = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, CreateFormData>({
    url: "/api/admin/forms/create",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useUpdateFormArchiveStatus = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<null, Record<string, never>, UpdateFormArchiveStatusData>({
    url: "/api/admin/forms/archiveStatus",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useUpdateForm = (
  params?: UseFetchAPIParams<{ statusCode: number }>,
) => {
  return useFetchAPI<
    { statusCode: number },
    Record<string, never>,
    UpdateFormData //TODO: Fix type
  >({
    url: "/api/admin/forms/update",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
