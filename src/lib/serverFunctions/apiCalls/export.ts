import { UseFetchAPIParams } from "@/lib/types/backendCalls/APIResponse";
import { useFetchAPI } from "@/lib/utils/useFetchAPI";

import type {
  ExportAssessmentsData,
  ExportDailyTallysData,
  ExportDailyTallysFromSingleLocationData,
  ExportIndividualTallysToCSVData,
  ExportRegistrationData,
} from "./exportParamsSchemas";

export type {
  ExportAssessmentsData,
  ExportDailyTallysData,
  ExportDailyTallysFromSingleLocationData,
  ExportIndividualTallysToCSVData,
  ExportRegistrationData,
} from "./exportParamsSchemas";

export type ExportRegistrationResponse = {
  statusCode: number;
  CSVstring: string | null;
};

export type ExportAssessmentsResponse = {
  statusCode: number;
  csvObjs: { formName: string; csvString: string }[];
};

export type ExportDailyTallysResponse = {
  statusCode: number;
  CSVstringWeekdays: string[];
  CSVstringWeekendDays: string[];
};

export type ExportCSVResponse = {
  statusCode: number;
  CSVstring: string | null;
};

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

export const useExportDailyTallys = (
  params?: UseFetchAPIParams<ExportDailyTallysResponse>,
) => {
  return useFetchAPI<
    ExportDailyTallysResponse,
    Record<string, never>,
    ExportDailyTallysData
  >({
    url: "/api/admin/export/dailyTallys",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useExportDailyTallysFromSingleLocation = (
  params?: UseFetchAPIParams<ExportCSVResponse>,
) => {
  return useFetchAPI<
    ExportCSVResponse,
    Record<string, never>,
    ExportDailyTallysFromSingleLocationData
  >({
    url: "/api/admin/export/dailyTallysFromSingleLocation",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};

export const useExportIndividualTallysToCSV = (
  params?: UseFetchAPIParams<ExportCSVResponse>,
) => {
  return useFetchAPI<
    ExportCSVResponse,
    Record<string, never>,
    ExportIndividualTallysToCSVData
  >({
    url: "/api/admin/export/individualTallys",
    callbacks: params?.callbacks,
    options: {
      method: "POST",
    },
  });
};
