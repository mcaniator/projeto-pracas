import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  ExportAssessmentsData,
  ExportAssessmentsResponse,
  ExportRegistrationData,
  ExportRegistrationResponse,
} from "../mutations/exportToCSV";

export const useExportRegistrationData = (
  params?: UseFetchAPIParams<ExportRegistrationResponse>,
) => {
  return useFetchAPI<
    ExportRegistrationResponse,
    Record<string, never>,
    ExportRegistrationData
  >({
    url: "/api/admin/export/registrationData",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useExportAssessments = (
  params?: UseFetchAPIParams<ExportAssessmentsResponse>,
) => {
  return useFetchAPI<
    ExportAssessmentsResponse,
    Record<string, never>,
    ExportAssessmentsData
  >({
    url: "/api/admin/export/assessments",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
