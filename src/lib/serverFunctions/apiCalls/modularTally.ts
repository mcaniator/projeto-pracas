import type {
  CreateModularTallyTemplateData,
  UpdateModularTallyTemplateArchiveStatusData,
  UpdateTallyTemplateData,
} from "@/lib/serverFunctions/mutations/modularTally";
import type {
  FetchModularTallyTemplateStructureParams,
  FetchModularTallyTemplateStructureResponse,
  FetchModularTallyTemplatesParams,
  FetchModularTallyTemplatesResponse,
} from "@/lib/serverFunctions/queries/modularTally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchModularTallyTemplates = (
  params?: UseFetchAPIParams<FetchModularTallyTemplatesResponse>,
) => {
  return useFetchAPI<
    FetchModularTallyTemplatesResponse,
    FetchModularTallyTemplatesParams
  >({
    url: "/api/admin/modularTallyTemplates",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useFetchModularTallyTemplateStructure = (
  params?: UseFetchAPIParams<FetchModularTallyTemplateStructureResponse>,
) => {
  return useFetchAPI<
    FetchModularTallyTemplateStructureResponse,
    FetchModularTallyTemplateStructureParams
  >({
    url: "/api/admin/modularTallyTemplates/details",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useCreateModularTallyTemplate = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    CreateModularTallyTemplateData
  >({
    url: "/api/admin/modularTallyTemplates/create",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useUpdateTallyTemplate = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, UpdateTallyTemplateData>({
    url: "/api/admin/modularTallyTemplates/update",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useUpdateModularTallyTemplateArchiveStatus = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    UpdateModularTallyTemplateArchiveStatusData
  >({
    url: "/api/admin/modularTallyTemplates/archiveStatus",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};
