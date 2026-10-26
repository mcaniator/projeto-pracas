import { useFetchBlobAPI } from "@/lib/utils/useFetchBlobAPI";
import type { UseFetchBlobAPIParams } from "@/lib/utils/useFetchBlobAPI";

import type { FetchAssessmentsExportParams } from "../queries/assessmentExport";

type FetchAssessmentsExportRequestParams = Omit<
  FetchAssessmentsExportParams,
  "state"
> & {
  state?: FetchAssessmentsExportParams["state"] | null;
};

export const useFetchAssessmentsExport = (params?: UseFetchBlobAPIParams) => {
  return useFetchBlobAPI<FetchAssessmentsExportRequestParams>({
    url: "/api/admin/assessments/export",
    callbacks: params?.callbacks,
    options: {
      method: "GET",
    },
  });
};
