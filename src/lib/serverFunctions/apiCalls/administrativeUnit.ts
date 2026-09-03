import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  DeleteAdministrativeUnitData,
  DeleteAdministrativeUnitResponse,
  SaveAdministrativeUnitData,
} from "../mutations/administrativeUnit";

export const useSaveAdministrativeUnit = (params?: UseFetchAPIParams<null>) => {
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
