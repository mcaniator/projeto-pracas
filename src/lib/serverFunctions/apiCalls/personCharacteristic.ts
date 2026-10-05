import type {
  DeletePersonCharacteristicData,
  DeletePersonCharacteristicGroupData,
  SavePersonCharacteristicData,
  SavePersonCharacteristicGroupData,
} from "@/lib/serverFunctions/mutations/personCharacteristic";
import type {
  FetchPersonCharacteristicGroupsParams,
  FetchPersonCharacteristicGroupsResponse,
} from "@/lib/serverFunctions/queries/personCharacteristic";
import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

const personCharacteristicGroupsUrl = "/api/admin/personCharacteristicGroups";

export const useFetchPersonCharacteristicGroups = (
  params?: UseFetchAPIParams<FetchPersonCharacteristicGroupsResponse>,
) => {
  return useFetchAPI<
    FetchPersonCharacteristicGroupsResponse,
    FetchPersonCharacteristicGroupsParams
  >({
    url: personCharacteristicGroupsUrl,
    callbacks: params?.callbacks,
    options: { method: "GET" },
  });
};

export const useSavePersonCharacteristicGroup = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    SavePersonCharacteristicGroupData
  >({
    url: `${personCharacteristicGroupsUrl}/save`,
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useDeletePersonCharacteristicGroup = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    DeletePersonCharacteristicGroupData
  >({
    url: `${personCharacteristicGroupsUrl}/delete`,
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useSavePersonCharacteristic = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    SavePersonCharacteristicData
  >({
    url: "/api/admin/personCharacteristics/save",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};

export const useDeletePersonCharacteristic = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<
    null,
    Record<string, never>,
    DeletePersonCharacteristicData
  >({
    url: "/api/admin/personCharacteristics/delete",
    callbacks: params?.callbacks,
    options: { method: "POST" },
  });
};
