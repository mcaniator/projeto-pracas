import type {
  CreateBehavioralMapData,
  CreateBehavioralMapProtocolData,
  CreateBehavioralMapResponse,
  UpdateBehavioralMapProtocolArchiveStatusData,
  UpdateBehavioralMapProtocolData,
} from "@/lib/serverFunctions/mutations/behavioralMapProtocol";
import type {
  FetchBehavioralMapUsersResponse,
  FetchBehavioralMapsParams,
  FetchBehavioralMapsResponse,
} from "@/lib/serverFunctions/queries/behavioralMap";
import type {
  FetchBehavioralMapProtocolsParams,
  FetchBehavioralMapProtocolsResponse,
} from "@/lib/serverFunctions/queries/behavioralMapProtocol";
import type {
  FetchBehavioralMapProtocolStructureParams,
  FetchBehavioralMapProtocolStructureResponse,
} from "@/lib/serverFunctions/queries/behavioralMapProtocolStructure";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchBehavioralMapProtocols = (
  params?: UseFetchAPIParams<FetchBehavioralMapProtocolsResponse>,
) => {
  return useFetchAPI<
    FetchBehavioralMapProtocolsResponse,
    FetchBehavioralMapProtocolsParams
  >({
    url: "/api/admin/behavioralMapProtocols",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useFetchBehavioralMaps = (
  params?: UseFetchAPIParams<FetchBehavioralMapsResponse>,
) => {
  return useFetchAPI<FetchBehavioralMapsResponse, FetchBehavioralMapsParams>({
    url: "/api/admin/behavioralMaps",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useFetchBehavioralMapUsers = (
  params?: UseFetchAPIParams<FetchBehavioralMapUsersResponse>,
) => {
  return useFetchAPI<FetchBehavioralMapUsersResponse, Record<string, never>>({
    url: "/api/admin/behavioralMaps/users",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useCreateBehavioralMap = (
  params?: UseFetchAPIParams<CreateBehavioralMapResponse>,
) => {
  return useFetchAPI<
    CreateBehavioralMapResponse,
    Record<string, never>,
    CreateBehavioralMapData
  >({
    url: "/api/admin/behavioralMaps/create",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useFetchBehavioralMapProtocolStructure = (
  params?: UseFetchAPIParams<FetchBehavioralMapProtocolStructureResponse>,
) => {
  return useFetchAPI<
    FetchBehavioralMapProtocolStructureResponse,
    FetchBehavioralMapProtocolStructureParams
  >({
    url: "/api/admin/behavioralMapProtocols/details",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useCreateBehavioralMapProtocol = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    CreateBehavioralMapProtocolData
  >({
    url: "/api/admin/behavioralMapProtocols/create",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useUpdateBehavioralMapProtocol = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    UpdateBehavioralMapProtocolData
  >({
    url: "/api/admin/behavioralMapProtocols/update",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useUpdateBehavioralMapProtocolArchiveStatus = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    UpdateBehavioralMapProtocolArchiveStatusData
  >({
    url: "/api/admin/behavioralMapProtocols/archiveStatus",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};
