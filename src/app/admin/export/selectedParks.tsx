"use client";

import {
  IconCheck,
  IconCircleMinus,
  IconEdit,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";

import PermissionGuard from "../../../components/auth/permissionGuard";
import { Button } from "../../../components/button";
import { useHelperCard } from "../../../components/context/helperCardContext";
import {
  exportDailyTallys,
  exportEvaluation,
  exportRegistrationData,
} from "../../../serverActions/exportToCSV";
import {
  ExportPageModes,
  SelectedLocationObj,
  SelectedLocationSavedObj,
} from "./client";

const SelectedParks = ({
  locations,
  selectedLocationsObjs,
  selectedLocationsSaved,
  handleSelectedLocationsRemoval,
  handlePageStateChange,
}: {
  locations: { id: number; name: string }[];
  selectedLocationsObjs: SelectedLocationObj[];
  selectedLocationsSaved: SelectedLocationSavedObj[];
  handleSelectedLocationsRemoval: (id: number) => void;
  handlePageStateChange: (id: number, pageMode: ExportPageModes) => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const [missingInfoSaveWarning, setMissingInfoSaveWarning] = useState(false);
  const [loadingExport, setLoadingExport] = useState({
    registrationsData: false,
    evaluations: false,
    tallys: false,
  });
  const handleRegistrationDataExport = async () => {
    if (selectedLocationsSaved.find((location) => !location.saved)) {
      return;
    }
    setLoadingExport((prev) => ({ ...prev, registrationsData: true }));
    const locationsToExport = selectedLocationsObjs.filter(
      (location) => location.exportRegistrationInfo,
    );
    const locationsIds = locationsToExport.map((location) => location.id);
    const response = await exportRegistrationData(locationsIds);
    if (response.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para exportar dados de praças!</>,
      });
      return;
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro exportar dados de praças!</>,
      });
      return;
    }
    const csvString = response.CSVstring;
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
    setHelperCard({
      show: true,
      helperCardType: "CONFIRM",
      content: <>Dados de praças exportados!</>,
    });
    setLoadingExport((prev) => ({ ...prev, registrationsData: false }));
  };
  const handleEvaluationExport = async () => {
    if (selectedLocationsSaved.find((location) => !location.saved)) {
      return;
    }
    setLoadingExport((prev) => ({ ...prev, evaluations: true }));
    const locationsToExportEvaluations = selectedLocationsObjs.filter(
      (location) => location.assessments.length > 0,
    );
    const response = await exportEvaluation(
      locationsToExportEvaluations
        .map((location) =>
          location.assessments.map((assessment) => assessment.id),
        )
        .flat(),
    );
    if (response.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para exportar avaliações!</>,
      });
      return;
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro exportar avaliações!</>,
      });
      return;
    }
    const csvObjs = response.csvObjs;
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
    setHelperCard({
      show: true,
      helperCardType: "CONFIRM",
      content: <>Avaliações exportadas!</>,
    });
    setLoadingExport((prev) => ({ ...prev, evaluations: false }));
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
    setLoadingExport((prev) => ({ ...prev, tallys: true }));
    const response = await exportDailyTallys(
      locationsToExportTallys.map((location) => location.id),
      tallysIds,
    );
    if (response.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para exportar avaliações!</>,
      });
      return;
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro exportar avaliações!</>,
      });
      return;
    }
    const csvObj = {
      CSVstringWeekdays: response.CSVstringWeekdays,
      CSVstringWeekendDays: response.CSVstringWeekendDays,
    };
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
    setHelperCard({
      show: true,
      helperCardType: "CONFIRM",
      content: <>Contagens exportadas!</>,
    });
    setLoadingExport((prev) => ({ ...prev, tallys: false }));
  };
  return (
    <div className="flex flex-col gap-2">
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
                  className="text-black"
                  onPress={() => {
                    handlePageStateChange(locationObj.id, "EDIT");
                  }}
                  variant={"ghost"}
                >
                  <IconEdit size={24} />
                </Button>
                <Button
                  className="text-red-500"
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
        {missingInfoSaveWarning &&
          selectedLocationsSaved.filter((location) => !location.saved)
            .length !== 0 && (
            <span className="text-redwood">{`${selectedLocationsSaved.filter((location) => !location.saved).length} ${selectedLocationsSaved.filter((location) => !location.saved).length === 1 ? "praça" : "praças"}  sem parâmetros salvos!`}</span>
          )}
        <Button
          isDisabled={loadingExport.registrationsData}
          className="h-fit"
          onPress={() => {
            if (
              selectedLocationsSaved.filter((location) => !location.saved)
                .length === 0
            ) {
              setMissingInfoSaveWarning(false);
              handleRegistrationDataExport().catch(() => ({ statusCode: 1 }));
            } else {
              setMissingInfoSaveWarning(true);
            }
          }}
        >
          {loadingExport.registrationsData ?
            "Exportando..."
          : "Exportar dados de cadastro"}
        </Button>
        <PermissionGuard requiresAnyRoleGroups={["ASSESSMENT"]}>
          <Button
            className="h-fit"
            isDisabled={loadingExport.evaluations}
            onPress={() => {
              if (
                selectedLocationsSaved.filter((location) => !location.saved)
                  .length === 0
              ) {
                setMissingInfoSaveWarning(false);
                handleEvaluationExport().catch(() => ({ statusCode: 1 }));
              } else {
                setMissingInfoSaveWarning(true);
              }
            }}
          >
            {loadingExport.evaluations ?
              "Exportando..."
            : "Exportar avaliações físicas"}
          </Button>
        </PermissionGuard>
        <PermissionGuard requiresAnyRoleGroups={["TALLY"]}>
          <Button
            className="h-fit"
            isDisabled={loadingExport.tallys}
            onPress={() => {
              if (
                selectedLocationsSaved.filter((location) => !location.saved)
                  .length === 0
              ) {
                setMissingInfoSaveWarning(false);
                handleTallysExport().catch(() => ({ statusCode: 1 }));
              } else {
                setMissingInfoSaveWarning(true);
              }
            }}
          >
            {loadingExport.tallys ? "Exportando..." : "Exportar contagens"}
          </Button>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default SelectedParks;
