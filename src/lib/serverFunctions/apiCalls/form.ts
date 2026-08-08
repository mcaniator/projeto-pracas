import type {
  FetchFormParams,
  FetchFormsResponse,
  fetchFormStructureParams,
  fetchFormStructureResponse,
} from "@/lib/serverFunctions/queries/form";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  CreateFormData,
  UpdateFormArchiveStatusData,
  UpdateFormData,
  UpdateFormResponse,
} from "../mutations/formUtil";

export const useFetchForms = (
  params?: UseFetchAPIParams<FetchFormsResponse>,
) => {
  const url = "/api/admin/forms";

  return useFetchAPI<FetchFormsResponse, FetchFormParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useFetchFormStructure = (
  params?: UseFetchAPIParams<fetchFormStructureResponse>,
) => {
  return useFetchAPI<fetchFormStructureResponse, fetchFormStructureParams>({
    url: "/api/admin/forms/editor",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
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
  params?: UseFetchAPIParams<UpdateFormResponse>,
) => {
  return useFetchAPI<UpdateFormResponse, Record<string, never>, UpdateFormData>(
    {
      url: "/api/admin/forms/update",
      callbacks: params?.callbacks,
      options: {
        method: "POST",
      },
    },
  );
};
