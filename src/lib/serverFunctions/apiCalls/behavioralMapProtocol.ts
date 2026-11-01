import type {
  CreateBehavioralMapProtocolData,
  UpdateBehavioralMapProtocolArchiveStatusData,
  UpdateBehavioralMapProtocolData,
} from "@/lib/serverFunctions/mutations/behavioralMapProtocol";
import type {
  FetchBehavioralMapProtocolsParams,
  FetchBehavioralMapProtocolsResponse,
} from "@/lib/serverFunctions/queries/behavioralMapProtocol";
import type {
  FetchBehavioralMapProtocolStructureParams,
  FetchBehavioralMapProtocolStructureResponse,
} from "@/lib/serverFunctions/queries/behavioralMapProtocolStructure";
import type { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchBehavioralMapProtocols = (
  params?: UseFetchAPIParams<FetchBehavioralMapProtocolsResponse>,
) =>
  useFetchAPI<
    FetchBehavioralMapProtocolsResponse,
    FetchBehavioralMapProtocolsParams
  >({
    url: "/api/admin/behavioralMapProtocols",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });

export const useCreateBehavioralMapProtocol = (
  params?: UseFetchAPIParams<null>,
) =>
  useFetchAPI<null, Record<string, never>, CreateBehavioralMapProtocolData>({
    url: "/api/admin/behavioralMapProtocols/create",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });

export const useUpdateBehavioralMapProtocol = (
  params?: UseFetchAPIParams<null>,
) =>
  useFetchAPI<null, Record<string, never>, UpdateBehavioralMapProtocolData>({
    url: "/api/admin/behavioralMapProtocols/update",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });

export const useUpdateBehavioralMapProtocolArchiveStatus = (
  params?: UseFetchAPIParams<null>,
) =>
  useFetchAPI<
    null,
    Record<string, never>,
    UpdateBehavioralMapProtocolArchiveStatusData
  >({
    url: "/api/admin/behavioralMapProtocols/archiveStatus",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });

export const useFetchBehavioralMapProtocolStructure = (
  params?: UseFetchAPIParams<FetchBehavioralMapProtocolStructureResponse>,
) =>
  useFetchAPI<
    FetchBehavioralMapProtocolStructureResponse,
    FetchBehavioralMapProtocolStructureParams
  >({
    url: "/api/admin/behavioralMapProtocols/details",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
