import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  DeleteAdministrativeUnitData,
  SaveAdministrativeUnitData,
} from "./administrativeUnitParamsSchemas";

export type {
  DeleteAdministrativeUnitData,
  SaveAdministrativeUnitData,
} from "./administrativeUnitParamsSchemas";

export type DeleteAdministrativeUnitResponse = {
  conflictingItems: {
    cityId: number;
    cityName: string;
    locations: { name: string }[];
  }[];
} | null;

export const useSaveAdministrativeUnit = (
  params?: UseFetchAPIParams<null>,
) => {
  return useFetchAPI<null, Record<string, never>, SaveAdministrativeUnitData>({
    url: "/api/admin/administrativeUnits/save",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useDeleteAdministrativeUnit = (
  params?: UseFetchAPIParams<DeleteAdministrativeUnitResponse>,
) => {
  return useFetchAPI<
    DeleteAdministrativeUnitResponse,
    Record<string, never>,
    DeleteAdministrativeUnitData
  >({
    url: "/api/admin/administrativeUnits/delete",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
