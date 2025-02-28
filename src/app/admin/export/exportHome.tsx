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
    <div className="flex flex-row justify-center gap-5 overflow-auto">
      <div className="hidden basis-3/5 flex-col gap-1 overflow-auto md:flex">
        <h4 className="text-xl font-semibold">
          Selecione as praças as quais deseja exportar dados
        </h4>
        <ParkSearch
          location={locations}
          selectedLocations={selectedLocationsObjs}
          handleSelectedLocationsAddition={handleSelectedLocationsAddition}
        />
      </div>

      <div className="flex w-full flex-col gap-2 overflow-auto p-0 sm:bg-gray-400/20 md:w-fit md:basis-2/5 md:rounded-3xl md:p-3 md:shadow-inner">
        <h4 className="text-xl font-semibold">Praças selecionadas</h4>
        <div className="inline md:hidden">
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
