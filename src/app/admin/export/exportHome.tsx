"use client";

import { Button } from "@/components/button";
import { exportDailyTallys } from "@/serverActions/exportToCSV";
import {
  IconCheck,
  IconCircleMinus,
  IconEdit,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";

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
  const [loadingExport, setLoadingExport] = useState(false);
  const handleTallysExport = async () => {
    if (selectedLocationsSaved.find((location) => !location.saved)) {
      return;
    }
    const tallysIds: number[] = [];
    selectedLocationsTallys.forEach((location) =>
      tallysIds.push(...location.tallysIds),
    );
    if (!tallysIds || tallysIds.length === 0) return;

    let csvString = "";
    setLoadingExport(true);
    csvString = await exportDailyTallys(tallysIds, ["name", "id", "date"]);
    const blob = new Blob([csvString]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Contagens diárias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLoadingExport(false);
  };
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
        <Button
          isDisabled={loadingExport}
          onPress={() => {
            handleTallysExport().catch(() => ({ statusCode: 1 }));
          }}
        >
          {loadingExport ? "Exportando..." : "Exportar"}
        </Button>
      </div>
    </div>
  );
};

export { ExportHome };
