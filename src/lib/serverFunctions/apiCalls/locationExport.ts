import type { UseFetchBlobAPIParams } from "@/lib/utils/useFetchBlobAPI";
import { useFetchBlobAPI } from "@/lib/utils/useFetchBlobAPI";

import { FetchLocationExportParams } from "../queries/locationExport";

export const useFetchLocationsExport = (params?: UseFetchBlobAPIParams) => {
  return useFetchBlobAPI<FetchLocationExportParams>({
    url: "/api/admin/locations/export/",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
