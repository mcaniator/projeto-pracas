"use client";

import { useState } from "react";

import { EditPage } from "./editPage";
import { ExportHome } from "./exportHome";

type ExportPageModes = "HOME" | "EDIT";
interface SelectedLocationTallyObj {
  id: number;
  assessmentId: number | undefined;
  tallysIds: number[];
}
interface SelectedLocationSavedObj {
  id: number;
  saved: boolean;
}
const ExportClientPage = ({
  locations,
}: {
  locations: { id: number; name: string }[];
}) => {
  const [selectedLocationsTallys, setSelectedLocationsTallys] = useState<
    SelectedLocationTallyObj[]
  >([]);
  const [selectedLocationsSaved, setSelectedLocationsSaved] = useState<
    SelectedLocationSavedObj[]
  >([]);
  const [pageState, setPageState] = useState<{
    pageMode: ExportPageModes;
    currentLocation: number | undefined;
  }>({ pageMode: "HOME", currentLocation: undefined });
  const handleSelectedLocationsAddition = (
    locationObj: SelectedLocationTallyObj,
  ) => {
    if (
      !selectedLocationsTallys.some(
        (location) => location.id === locationObj.id,
      )
    ) {
      setSelectedLocationsTallys((prev) => [...prev, locationObj]);
    }
    if (
      !selectedLocationsSaved.some((location) => location.id === locationObj.id)
    ) {
      setSelectedLocationsSaved((prev) => [
        ...prev,
        { id: locationObj.id, saved: false },
      ]);
    }
  };
  const handleSelectedLocationsTallyChange = (
    locationId: number,
    tallysIds: number[] | undefined,
  ) => {
    setSelectedLocationsTallys((prev) =>
      prev.map((locationObj) =>
        locationObj.id === locationId ?
          { ...locationObj, ...(tallysIds && { tallysIds: tallysIds }) }
        : locationObj,
      ),
    );
  };
  const handleSelectedLocationsSaveChange = (
    locationId: number,
    save: boolean,
  ) => {
    setSelectedLocationsSaved((prev) =>
      prev.map((locationObj) =>
        locationObj.id === locationId ?
          { id: locationId, saved: save }
        : locationObj,
      ),
    );
  };
  const handleSelectedLocationsRemoval = (id: number) => {
    if (selectedLocationsTallys.some((location) => location.id === id)) {
      setSelectedLocationsTallys((prev) =>
        prev.filter((item) => item.id !== id),
      );
    }
    if (selectedLocationsSaved.some((location) => location.id === id)) {
      setSelectedLocationsSaved((prev) =>
        prev.filter((item) => item.id !== id),
      );
    }
  };
  const handlePageStateChange = (
    id: number | undefined,
    pageMode: ExportPageModes,
  ) => {
    setPageState({ pageMode, currentLocation: id });
  };

  return (
    <div className="flex h-full max-h-full min-h-0 max-w-full gap-5 p-5">
      <div className="flex flex-col gap-1 overflow-auto rounded-3xl bg-gray-300/30 p-3 text-white shadow-md">
        <h3 className="text-2xl font-semibold">Exportar dados</h3>
        {pageState.pageMode === "HOME" && (
          <ExportHome
            locations={locations}
            selectedLocationsTallys={selectedLocationsTallys}
            selectedLocationsSaved={selectedLocationsSaved}
            handleSelectedLocationsAddition={handleSelectedLocationsAddition}
            handleSelectedLocationsRemoval={handleSelectedLocationsRemoval}
            handlePageStateChange={handlePageStateChange}
          />
        )}
        {pageState.pageMode === "EDIT" && (
          <EditPage
            locationId={pageState.currentLocation}
            locations={locations}
            selectedLocationsTallys={selectedLocationsTallys}
            selectedLocationsSaved={selectedLocationsSaved}
            handlePageStateChange={handlePageStateChange}
            handleSelectedLocationsSaveChange={
              handleSelectedLocationsSaveChange
            }
            handleSelectedLocationsTallyChange={
              handleSelectedLocationsTallyChange
            }
          />
        )}
      </div>
    </div>
  );
};

export { ExportClientPage };
export {
  type ExportPageModes,
  type SelectedLocationTallyObj,
  type SelectedLocationSavedObj,
};
