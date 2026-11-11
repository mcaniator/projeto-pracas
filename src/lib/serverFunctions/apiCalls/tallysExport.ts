import { useFetchBlobAPI } from "@/lib/utils/useFetchBlobAPI";
import type { UseFetchBlobAPIParams } from "@/lib/utils/useFetchBlobAPI";

import type { FetchTallysExportParams } from "../queries/tallysExport";

type FetchTallysExportRequestParams = Omit<FetchTallysExportParams, "state"> & {
  state?: FetchTallysExportParams["state"] | null;
};

export const useFetchTallysExport = (params?: UseFetchBlobAPIParams) => {
  return useFetchBlobAPI<FetchTallysExportRequestParams>({
    url: "/api/admin/tallys/export",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
