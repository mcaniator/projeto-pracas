"use client";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
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
  const [desiredNumberObservations, setDesiredNumberObservations] = useState(4);
  const [missingTallySaveWarning, setMissingTallySaveWarning] = useState(false);
  const handleTallysExport = async () => {
    if (selectedLocationsSaved.find((location) => !location.saved)) {
      return;
    }
    const tallysIds: number[] = [];
    selectedLocationsTallys.forEach((location) =>
      tallysIds.push(...location.tallysIds),
    );
    if (!tallysIds || tallysIds.length === 0) return;
    setLoadingExport(true);
    const csvObj = await exportDailyTallys(
      locations.map((location) => location.id),
      tallysIds,
      ["name", "id", "date"],
      desiredNumberObservations,
    );
    if (csvObj?.CSVstringWeekdays) {
      for (let i = 0; i < csvObj?.CSVstringWeekdays.length; i++) {
        const csvString = csvObj.CSVstringWeekdays[i];
        if (csvString) {
          const blob = new Blob([csvString]);
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `Contagem-Semana-Dia${i + 1}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
    if (csvObj.CSVstringWeekendDays) {
      for (let i = 0; i < csvObj?.CSVstringWeekendDays.length; i++) {
        const csvString = csvObj.CSVstringWeekendDays[i];
        if (csvString) {
          const blob = new Blob([csvString]);
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `Contagem-FimSemana-Dia${i + 1}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    }
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
        <div className="flex flex-col gap-1">
          <label htmlFor="desired-number-tallys">
            Selecione o número desejável de observações por dia
          </label>
          <Input
            id="desired-number-tallys"
            type="number"
            onChange={(e) => {
              const value = Number(e);
              if (value > 0) {
                setDesiredNumberObservations(value);
              }
            }}
            value={desiredNumberObservations.toString()}
          />
          {missingTallySaveWarning &&
            selectedLocationsSaved.filter((location) => !location.saved)
              .length !== 0 && (
              <span className="text-redwood">{`${selectedLocationsSaved.filter((location) => !location.saved).length} ${selectedLocationsSaved.filter((location) => !location.saved).length === 1 ? "contagem" : "contagens"}  sem parâmetros salvos!`}</span>
            )}
          <Button
            isDisabled={loadingExport}
            onPress={() => {
              if (
                selectedLocationsSaved.filter((location) => !location.saved)
                  .length === 0
              ) {
                setMissingTallySaveWarning(false);
                handleTallysExport().catch(() => ({ statusCode: 1 }));
              } else {
                setMissingTallySaveWarning(true);
              }
            }}
          >
            {loadingExport ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ExportHome };
