"use client";

import { Button } from "@/components/button";
import {
  exportDailyTallys,
  exportEvaluation,
  exportRegistrationData,
} from "@/serverActions/exportToCSV";
import {
  IconCheck,
  IconCircleMinus,
  IconEdit,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";

import {
  ExportPageModes,
  SelectedLocationObj,
  SelectedLocationSavedObj,
} from "./client";
import { ParkSearch } from "./parkSearch";

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
  const [loadingExport, setLoadingExport] = useState(false);
  const [missingTallySaveWarning, setMissingTallySaveWarning] = useState(false);
  const handleRegistrationDataExport = async () => {
    if (selectedLocationsSaved.find((location) => !location.saved)) {
      return;
    }
    setLoadingExport(true);
    const locationsToExport = selectedLocationsObjs.filter(
      (location) => location.exportRegistrationInfo,
    );
    const locationsIds = locationsToExport.map((location) => location.id);
    const csvString = await exportRegistrationData(locationsIds, [
      "name",
      "id",
      "date",
    ]);
    if (csvString) {
      const blob = new Blob([csvString]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Informações-Cadastro.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setLoadingExport(false);
  };
  const handleEvaluationExport = async () => {
    if (selectedLocationsSaved.find((location) => !location.saved)) {
      return;
    }
    const locationsToExportEvaluations = selectedLocationsObjs.filter(
      (location) => location.responses.length > 0,
    );
    const csvObjs = await exportEvaluation(
      locationsToExportEvaluations.map((location) => location.id),
      locationsToExportEvaluations.map((location) => location.responses).flat(),
    );
    for (const csvObj of csvObjs) {
      const blob = new Blob([csvObj.csvString]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Avaliações - ${csvObj.formName}, v.${csvObj.formVersion}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleTallysExport = async () => {
    if (selectedLocationsSaved.find((location) => !location.saved)) {
      return;
    }
    const locationsToExportTallys = selectedLocationsObjs.filter(
      (location) => location.tallysIds.length > 0,
    );
    const tallysIds: number[] = [];
    locationsToExportTallys.forEach((location) =>
      tallysIds.push(...location.tallysIds),
    );
    if (!tallysIds || tallysIds.length === 0) return;
    setLoadingExport(true);
    const csvObj = await exportDailyTallys(
      locationsToExportTallys.map((location) => location.id),
      tallysIds,
      ["name", "id", "date"],
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
    <div className="flex flex-row gap-5 overflow-auto">
      <div className="flex flex-col gap-1 overflow-auto">
        <h4 className="text-xl font-semibold">
          Selecione as praças as quais deseja exportar dados
        </h4>
        <ParkSearch
          location={locations}
          selectedLocations={selectedLocationsObjs}
          handleSelectedLocationsAddition={handleSelectedLocationsAddition}
        />
      </div>

      <div className="flex w-fit flex-col overflow-auto rounded-3xl bg-gray-400/20 p-3 text-white shadow-inner">
        <h4 className="text-xl font-semibold">Praças selecionadas</h4>
        <div className="flex flex-col overflow-auto rounded-md">
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
          {missingTallySaveWarning &&
            selectedLocationsSaved.filter((location) => !location.saved)
              .length !== 0 && (
              <span className="text-redwood">{`${selectedLocationsSaved.filter((location) => !location.saved).length} ${selectedLocationsSaved.filter((location) => !location.saved).length === 1 ? "praça" : "praças"}  sem parâmetros salvos!`}</span>
            )}
          <Button
            isDisabled={loadingExport}
            onPress={() => {
              if (
                selectedLocationsSaved.filter((location) => !location.saved)
                  .length === 0
              ) {
                setMissingTallySaveWarning(false);
                handleRegistrationDataExport().catch(() => ({ statusCode: 1 }));
              } else {
                setMissingTallySaveWarning(true);
              }
            }}
          >
            Exportar dados de cadastro
          </Button>
          <Button
            isDisabled={loadingExport}
            onPress={() => {
              if (
                selectedLocationsSaved.filter((location) => !location.saved)
                  .length === 0
              ) {
                setMissingTallySaveWarning(false);
                handleEvaluationExport().catch(() => ({ statusCode: 1 }));
              } else {
                setMissingTallySaveWarning(true);
              }
            }}
          >
            Exportar avaliações físicas
          </Button>
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
            {loadingExport ? "Exportando..." : "Exportar contagens"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ExportHome };
