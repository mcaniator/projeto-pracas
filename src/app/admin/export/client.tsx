"use client";

import CAdminHeader from "@/components/ui/cAdminHeader";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { LocationAssessment } from "@serverActions/assessmentUtil";

import { ExportHome } from "./exportHome";

type ExportPageModes = "HOME" | "EDIT";
export type SelectedLocationObj =
  FetchLocationsResponse["locations"][number] & {
    assessments: LocationAssessment[];
    exportRegistrationInfo: boolean;
    tallysIds: number[];
  };
interface SelectedLocationSavedObj {
  id: number;
  name: string;
  saved: boolean;
}
const ExportClientPage = () => {
  return (
    <div className="flex h-full w-full flex-col gap-1 overflow-auto bg-white p-2 text-black">
      <CAdminHeader title="Exportar dados" />
      <ExportHome />
    </div>
  );
};

export { ExportClientPage };
export {
  type ExportPageModes,
  type SelectedLocationObj,
  type SelectedLocationSavedObj,
};
