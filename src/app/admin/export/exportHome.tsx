"use client";

import { Button } from "@/components/button";
import {
  IconCheck,
  IconCircleMinus,
  IconEdit,
  IconX,
} from "@tabler/icons-react";

import {
  ExportPageModes,
  SelectedLocationSavedObj,
  SelectedLocationTallyObj,
} from "./client";
import { ParkSearch } from "./parkSearch";

const ExportHome = ({
  locations,
  selectedLocationsTallys,
  selectedLocationsSaved,
  handleSelectedLocationsAddition,
  handleSelectedLocationsRemoval,
  handlePageStateChange,
}: {
  locations: { id: number; name: string }[];
  selectedLocationsTallys: SelectedLocationTallyObj[];
  selectedLocationsSaved: SelectedLocationSavedObj[];
  handleSelectedLocationsAddition: (
    locationObj: SelectedLocationTallyObj,
  ) => void;
  handleSelectedLocationsRemoval: (id: number) => void;
  handlePageStateChange: (id: number, pageMode: ExportPageModes) => void;
}) => {
  return (
    <div className="flex flex-row gap-5">
      <div className="flex flex-col gap-1">
        <h4 className="text-xl font-semibold">
          Selecione as praças as quais deseja exportar dados
        </h4>
        <ParkSearch
          location={locations}
          selectedLocations={selectedLocationsTallys}
          handleSelectedLocationsAddition={handleSelectedLocationsAddition}
        />
      </div>

      <div className="w-fit overflow-auto rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner">
        <h4 className="text-xl font-semibold">Praças selecionadas</h4>
        <div className="flex flex-col">
          {selectedLocationsSaved.map((locationObj, index) => {
            const locationObject = locations.find(
              (item) => item.id === locationObj.id,
            );
            return (
              <div
                className="mb-2 flex items-center justify-between rounded bg-white p-2 text-black"
                key={index}
              >
                {locationObject?.name}
                <div className="flex items-center">
                  {locationObj.saved ?
                    <IconCheck color="green" />
                  : <IconX color="red" />}
                  <Button
                    onPress={() => {
                      handlePageStateChange(locationObj.id, "EDIT");
                    }}
                    variant={"ghost"}
                  >
                    <IconEdit size={24} />
                  </Button>
                  <Button
                    onPress={() => {
                      handleSelectedLocationsRemoval(locationObj.id);
                    }}
                    variant={"ghost"}
                  >
                    <IconCircleMinus size={24} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <Button>Exportar</Button>
      </div>
    </div>
  );
};

export { ExportHome };
