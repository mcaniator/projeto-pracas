import type {
  CreateTallyData,
  CreateTallyResponse,
  CreateTallyProtocolData,
  DeleteTallyData,
  TallySubmitData,
  TallySubmitResponse,
  UpdateTallyProtocolArchiveStatusData,
  UpdateTallyProtocolData,
} from "@/lib/serverFunctions/mutations/tally";
import type {
  FetchTallyDetailsParams,
  FetchTallyDetailsResponse,
  FetchTallyProtocolStructureParams,
  FetchTallyProtocolStructureResponse,
  FetchTallyProtocolsParams,
  FetchTallyProtocolsResponse,
  FetchTallyUsersResponse,
  FetchTallysParams,
  FetchTallysResponse,
} from "@/lib/serverFunctions/queries/tally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

export const useFetchTallyProtocols = (
  params?: UseFetchAPIParams<FetchTallyProtocolsResponse>,
) => {
  return useFetchAPI<
    FetchTallyProtocolsResponse,
    FetchTallyProtocolsParams
  >({
    url: "/api/admin/tallyProtocols",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useFetchTallys = (
  params?: UseFetchAPIParams<FetchTallysResponse>,
) => {
  return useFetchAPI<FetchTallysResponse, FetchTallysParams>({
    url: "/api/admin/tallys",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useFetchTallyDetails = (
  params?: UseFetchAPIParams<FetchTallyDetailsResponse>,
) => {
  return useFetchAPI<
    FetchTallyDetailsResponse,
    FetchTallyDetailsParams
  >({
    url: "/api/admin/tallys/details",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useFetchTallyUsers = (
  params?: UseFetchAPIParams<FetchTallyUsersResponse>,
) => {
  return useFetchAPI<FetchTallyUsersResponse, Record<string, never>>({
    url: "/api/admin/tallys/users",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useCreateTally = (
  params?: UseFetchAPIParams<CreateTallyResponse>,
) => {
  return useFetchAPI<
    CreateTallyResponse,
    Record<string, never>,
    CreateTallyData
  >({
    url: "/api/admin/tallys/create",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useDeleteTally = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, DeleteTallyData>({
    url: "/api/admin/tallys/delete",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useTallySubmit = (
  params?: UseFetchAPIParams<TallySubmitResponse>,
) => {
  return useFetchAPI<
    TallySubmitResponse,
    Record<string, never>,
    TallySubmitData
  >({
    url: "/api/admin/tallys/responses",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useFetchTallyProtocolStructure = (
  params?: UseFetchAPIParams<FetchTallyProtocolStructureResponse>,
) => {
  return useFetchAPI<
    FetchTallyProtocolStructureResponse,
    FetchTallyProtocolStructureParams
  >({
    url: "/api/admin/tallyProtocols/details",
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useCreateTallyProtocol = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    CreateTallyProtocolData
  >({
    url: "/api/admin/tallyProtocols/create",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useUpdateTallyProtocol = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, UpdateTallyProtocolData>({
    url: "/api/admin/tallyProtocols/update",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useUpdateTallyProtocolArchiveStatus = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    UpdateTallyProtocolArchiveStatusData
  >({
    url: "/api/admin/tallyProtocols/archiveStatus",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};
