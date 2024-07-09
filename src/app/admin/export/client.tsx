"use client";

import { useState } from "react";

import { EditPage } from "./editPage";
import { ExportHome } from "./exportHome";

type ExportPageModes = "HOME" | "EDIT";
interface SelectedLocationObj {
  id: number;
  assessmentId: number | undefined;
  tallysIds: number[];
  saved: boolean;
}
const ExportClientPage = ({
  locations,
}: {
  locations: { id: number; name: string }[];
}) => {
  const [selectedLocations, setSelectedLocations] = useState<
    SelectedLocationObj[]
  >([]);
  const [pageState, setPageState] = useState<{
    pageMode: ExportPageModes;
    currentLocation: number | undefined;
  }>({ pageMode: "HOME", currentLocation: undefined });
  const handleSelectedLocationsAddition = (
    locationObj: SelectedLocationObj,
  ) => {
    if (!selectedLocations.some((location) => location.id === locationObj.id)) {
      setSelectedLocations((prev) => [...prev, locationObj]);
    }
  };
  const handleSelectedLocationsSaveChange = (
    locationId: number,
    save: boolean,
    tallysIds: number[],
  ) => {
    setSelectedLocations((prev) =>
      prev.map((locationObj) =>
        locationObj.id === locationId ?
          { ...locationObj, ...(save && { tallysIds: tallysIds }), saved: save }
        : locationObj,
      ),
    );
  };
  const handleSelectedLocationsRemoval = (id: number) => {
    if (selectedLocations.some((location) => location.id === id)) {
      setSelectedLocations((prev) => prev.filter((item) => item.id !== id));
    }
  };
  const handlePageStateChange = (
    id: number | undefined,
    pageMode: ExportPageModes,
  ) => {
    setPageState({ pageMode, currentLocation: id });
  };
  console.log(selectedLocations);
  return (
    <div className="flex h-full max-h-full min-h-0 max-w-full gap-5 p-5">
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
            selectedLocations={selectedLocations}
            handlePageStateChange={handlePageStateChange}
            handleSelectedLocationsSaveChange={
              handleSelectedLocationsSaveChange
            }
          />
        )}
      </div>
    </div>
  );
};

export { ExportClientPage };
export { type ExportPageModes, type SelectedLocationObj };
