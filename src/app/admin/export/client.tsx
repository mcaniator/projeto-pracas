"use client";

import { useState } from "react";

import { EditPage } from "./editPage";
import { ExportHome } from "./exportHome";

type ExportPageModes = "HOME" | "EDIT";
const ExportClientPage = ({
  locations,
}: {
  locations: { id: number; name: string }[];
}) => {
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [pageState, setPageState] = useState<{
    pageMode: ExportPageModes;
    currentLocation: number | undefined;
  }>({ pageMode: "HOME", currentLocation: undefined });
  const handleSelectedLocationsAddition = (id: number) => {
    if (!selectedLocations.includes(id)) {
      setSelectedLocations((prev) => [...prev, id]);
    }
  };
  const handleSelectedLocationsRemoval = (id: number) => {
    if (selectedLocations.includes(id)) {
      setSelectedLocations((prev) => prev.filter((item) => item !== id));
    }
  };
  const handlePageStateChange = (
    id: number | undefined,
    pageMode: ExportPageModes,
  ) => {
    setPageState({ pageMode, currentLocation: id });
  };
  return (
    <div className="flex max-h-full min-h-0 max-w-full gap-5 p-5">
      <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">Exportar dados</h3>
        {pageState.pageMode === "HOME" && (
          <ExportHome
            locations={locations}
            selectedLocations={selectedLocations}
            handleSelectedLocationsAddition={handleSelectedLocationsAddition}
            handleSelectedLocationsRemoval={handleSelectedLocationsRemoval}
            handlePageStateChange={handlePageStateChange}
          />
        )}
        {pageState.pageMode === "EDIT" && (
          <EditPage
            locationId={pageState.currentLocation}
            locations={locations}
            handlePageStateChange={handlePageStateChange}
          />
        )}
      </div>
    </div>
  );
};

export { ExportClientPage };
export { type ExportPageModes };
