"use client";

import {
  ExportPageModes,
  SelectedLocationObj,
  SelectedLocationSavedObj,
} from "./client";
import { ParkSearch } from "./parkSearch";
import { ParkSearchModal } from "./parkSearchModal";
import SelectedParks from "./selectedParks";

const ExportHome = ({
  locations,
  selectedLocationsObjs,
  selectedLocationsSaved,
  handleSelectedLocationsAddition,
  handleSelectedLocationsRemoval,
  handlePageStateChange,
}: {
  locations: { id: number; name: string }[];
  selectedLocationsObjs: SelectedLocationObj[];
  selectedLocationsSaved: SelectedLocationSavedObj[];
  handleSelectedLocationsAddition: (locationObj: SelectedLocationObj) => void;
  handleSelectedLocationsRemoval: (id: number) => void;
  handlePageStateChange: (id: number, pageMode: ExportPageModes) => void;
}) => {
  return (
    <div className="flex flex-row gap-5 overflow-auto">
      <div className="hidden flex-col gap-1 overflow-auto lg:flex">
        <h4 className="text-xl font-semibold">
          Selecione as praças as quais deseja exportar dados
        </h4>
        <ParkSearch
          location={locations}
          selectedLocations={selectedLocationsObjs}
          handleSelectedLocationsAddition={handleSelectedLocationsAddition}
        />
      </div>

      <div className="flex w-full flex-col gap-2 overflow-auto p-0 text-white sm:bg-gray-400/20 lg:w-fit lg:rounded-3xl lg:p-3 lg:shadow-inner">
        <h4 className="text-xl font-semibold">Praças selecionadas</h4>
        <div className="inline lg:hidden">
          <ParkSearchModal
            locations={locations}
            selectedLocationsObjs={selectedLocationsObjs}
            handleSelectedLocationsAddition={handleSelectedLocationsAddition}
          />
        </div>
        <SelectedParks
          locations={locations}
          selectedLocationsObjs={selectedLocationsObjs}
          selectedLocationsSaved={selectedLocationsSaved}
          handleSelectedLocationsRemoval={handleSelectedLocationsRemoval}
          handlePageStateChange={handlePageStateChange}
        />
      </div>
    </div>
  );
};

export { ExportHome };
