"use client";

import CAdminHeader from "@/components/ui/cAdminHeader";
import { FetchLocationsResponse } from "@/lib/serverFunctions/queries/location";
import { IconTableExport } from "@tabler/icons-react";

import { ExportHome } from "./exportHome";

export type SelectedLocationObj =
  FetchLocationsResponse["locations"][number] & {
    assessmentsIds: number[];
  };

const ExportClientPage = () => {
  return (
    <div className="flex h-full w-full flex-col gap-1 overflow-auto bg-white p-2 text-black">
      <CAdminHeader title="Exportar dados" titleIcon={<IconTableExport />} />
      <ExportHome />
    </div>
  );
};

export { ExportClientPage };
