import type {
  FetchFinalizedTallysDataVisualizationParams,
  FetchFinalizedTallysDataVisualizationResponse,
  FetchOngoingTallyParams,
  FetchOngoingTallyResponse,
  FetchTallyUsersResponse,
  FetchTallysParams,
  FetchTallysResponse,
} from "@/lib/serverFunctions/queries/tally";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  CreateTallyData,
  CreateTallyResponse,
  DeleteTallyData,
  SaveOngoingTallyData,
  SaveOngoingTallyResponse,
} from "../mutations/tallyUtil";

export const useFetchTallys = (
  params?: UseFetchAPIParams<FetchTallysResponse>,
) => {
  const url = `/api/admin/tallys`;

  return useFetchAPI<FetchTallysResponse, FetchTallysParams>({
    url,
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useFetchTallyUsers = (
  params?: UseFetchAPIParams<FetchTallyUsersResponse>,
) => {
  return useFetchAPI<FetchTallyUsersResponse, Record<string, never>>({
    url: "/api/admin/tallys/users",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useFetchOngoingTally = (
  params?: UseFetchAPIParams<FetchOngoingTallyResponse>,
) => {
  return useFetchAPI<FetchOngoingTallyResponse, FetchOngoingTallyParams>({
    url: "/api/admin/tallys/ongoing",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};

export const useFetchFinalizedTallysDataVisualization = (
  params?: UseFetchAPIParams<FetchFinalizedTallysDataVisualizationResponse>,
) => {
  return useFetchAPI<
    FetchFinalizedTallysDataVisualizationResponse,
    FetchFinalizedTallysDataVisualizationParams
  >({
    url: "/api/admin/tallys/finalizedDataVisualization",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
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
    options: {
      method: "POST",
    },
  });
};

export const useSaveOngoingTallyData = (
  params?: UseFetchAPIParams<SaveOngoingTallyResponse>,
) => {
  return useFetchAPI<
    SaveOngoingTallyResponse,
    Record<string, never>,
    SaveOngoingTallyData
  >({
    url: "/api/admin/tallys/ongoing/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteTally = (params?: UseFetchAPIParams<null>) => {
  return useFetchAPI<null, Record<string, never>, DeleteTallyData>({
    url: "/api/admin/tallys/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
