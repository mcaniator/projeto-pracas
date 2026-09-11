import type {
  CreateModularTallyTemplateData,
  UpdateModularTallyTemplateArchiveStatusData,
} from "@/lib/serverFunctions/mutations/modularTally";
import type {
  FetchModularTallyTemplatesParams,
  FetchModularTallyTemplatesResponse,
  FetchModularTallyTemplateStructureParams,
  FetchModularTallyTemplateStructureResponse,
} from "@/lib/serverFunctions/queries/modularTally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

const modularTallyTemplatesUrl = "/api/admin/modularTallyTemplates";

export const useFetchModularTallyTemplates = (
  params?: UseFetchAPIParams<FetchModularTallyTemplatesResponse>,
) => {
  return useFetchAPI<
    FetchModularTallyTemplatesResponse,
    FetchModularTallyTemplatesParams
  >({
    url: modularTallyTemplatesUrl,
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
    url: `${modularTallyTemplatesUrl}/details`,
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
    url: `${modularTallyTemplatesUrl}/create`,
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
    url: `${modularTallyTemplatesUrl}/archiveStatus`,
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};
