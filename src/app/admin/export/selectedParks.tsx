"use client";

import LocationParamsDialog from "@/app/admin/export/locationParamsDialog";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import PermissionGuard from "@components/auth/permissionGuard";
import { useHelperCard } from "@components/context/helperCardContext";
import { Breadcrumbs, Divider } from "@mui/material";
import {
  _exportDailyTallys,
  _exportEvaluation,
  _exportIndividualTallysToCSV,
  _exportRegistrationData,
} from "@serverActions/exportToCSV";
import {
  IconBuildingCommunity,
  IconMapPin,
  IconMinus,
  IconPencil,
  IconTree,
} from "@tabler/icons-react";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";

import { SelectedLocationObj } from "./client";

const SelectedParks = ({
  selectedLocationsObjs,
  isMobileView,
  openDialog,
  handleSelectedLocationsRemoval,
  handleSelectedLocationObjChange,
  handleDialogClose,
}: {
  selectedLocationsObjs: SelectedLocationObj[];
  isMobileView: boolean;
  openDialog: boolean;
  handleSelectedLocationsRemoval: (id: number) => void;
  handleSelectedLocationObjChange: (locationObj: SelectedLocationObj) => void;
  handleDialogClose: () => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const [openLocationParamsDialog, setOpenLocationParamsDialog] =
    useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationObj | null>(null);
  const [loadingExport, setLoadingExport] = useState({
    registrationsData: false,
    evaluations: false,
    tallys: false,
    dailyTallys: false,
  });
  const handleRegistrationDataExport = async () => {
    setLoadingExport((prev) => ({ ...prev, registrationsData: true }));
    const locationsToExport = selectedLocationsObjs.filter(
      (location) => location.exportRegistrationInfo,
    );
    const locationsIds = locationsToExport.map((location) => location.id);
    const response = await _exportRegistrationData(locationsIds);
    if (response.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para exportar dados de praças!</>,
      });
      setLoadingExport((prev) => ({ ...prev, registrationsData: false }));
      return;
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro exportar dados de praças!</>,
      });
      setLoadingExport((prev) => ({ ...prev, registrationsData: false }));
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
    setLoadingExport((prev) => ({ ...prev, evaluations: true }));
    const locationsToExportEvaluations = selectedLocationsObjs.filter(
      (location) => location.assessments.length > 0,
    );
    const response = await _exportEvaluation(
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
      setLoadingExport((prev) => ({ ...prev, evaluations: false }));
      return;
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro exportar avaliações!</>,
      });
      setLoadingExport((prev) => ({ ...prev, evaluations: false }));
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
    const locationsToExportTallys = selectedLocationsObjs.filter(
      (location) => location.tallysIds.length > 0,
    );
    const tallysIds: number[] = [];
    locationsToExportTallys.forEach((location) =>
      tallysIds.push(...location.tallysIds),
    );
    if (!tallysIds || tallysIds.length === 0) return;
    setLoadingExport((prev) => ({ ...prev, dailyTallys: true }));
    const response = await _exportDailyTallys(
      locationsToExportTallys.map((location) => location.id),
      tallysIds,
    );
    if (response.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para exportar avaliações!</>,
      });
      setLoadingExport((prev) => ({ ...prev, dailyTallys: false }));
      return;
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro exportar avaliações!</>,
      });
      setLoadingExport((prev) => ({ ...prev, dailyTallys: false }));
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
    setLoadingExport((prev) => ({ ...prev, dailyTallys: false }));
  };

  const handleIndividualTallysToExport = async () => {
    const locationsToExportTallys = selectedLocationsObjs.filter(
      (location) => location.tallysIds.length > 0,
    );
    const tallysIds: number[] = [];
    locationsToExportTallys.forEach((location) =>
      tallysIds.push(...location.tallysIds),
    );
    if (!tallysIds || tallysIds.length === 0) return;
    setLoadingExport((prev) => ({ ...prev, tallys: true }));
    const response = await _exportIndividualTallysToCSV(tallysIds);
    if (response.statusCode === 401) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Sem permissão para exportar avaliações!</>,
      });
      setLoadingExport((prev) => ({ ...prev, tallys: false }));
      return;
    } else if (response.statusCode === 500) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro exportar avaliações!</>,
      });
      setLoadingExport((prev) => ({ ...prev, tallys: false }));
      return;
    }

    const csvString = response.CSVstring;
    if (csvString) {
      const blob = new Blob([csvString]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Contagens individuais.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setHelperCard({
      show: true,
      helperCardType: "CONFIRM",
      content: <>Contagens exportadas!</>,
    });
    setLoadingExport((prev) => ({ ...prev, tallys: false }));
  };

  const innerComponent = (
    <div className="flex h-full flex-col gap-2">
      <Virtuoso
        data={selectedLocationsObjs}
        components={{
          EmptyPlaceholder: () => <div>Nenhuma praça selecionada!</div>,
        }}
        style={{ height: "100%" }}
        itemContent={(_, l) => {
          return (
            <div key={l.id} className="pb-4">
              <div className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl">
                <div className="flex h-auto w-full flex-col gap-1">
                  <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                    <CIconChip icon={<IconTree />} tooltip="Praça" />
                    {`${l.name}`}
                  </span>
                  <Divider />
                  <div className="flex items-center">
                    <CIconChip
                      tooltip="Cidade - Estado"
                      icon={<IconMapPin />}
                    />
                    {`${l.cityName} - ${l.state}`}
                  </div>

                  <Divider />
                  <div className="flex items-center">
                    <CIconChip
                      icon={<IconBuildingCommunity />}
                      tooltip="Unidades Administrativas"
                    />
                    <Breadcrumbs separator="›" aria-label="breadcrumb">
                      {l.narrowAdministrativeUnitName ?
                        <div>{l.narrowAdministrativeUnitName}</div>
                      : <span className="ml-1">-</span>}
                      {l.intermediateAdministrativeUnitName ?
                        <div>{l.intermediateAdministrativeUnitName}</div>
                      : <span>-</span>}
                      {l.broadAdministrativeUnitName ?
                        <div>{l.broadAdministrativeUnitName}</div>
                      : <span>-</span>}
                    </Breadcrumbs>
                  </div>
                  <Divider />
                  <div className="flex items-center">
                    <span>
                      {`Exportar dados de cadastro:`}{" "}
                      <CSwitch disabled checked={l.exportRegistrationInfo} />
                    </span>
                  </div>
                  <Divider />
                  <div className="flex items-center">
                    <span>{`Avaliações selecionadas: ${l.assessments.length}/${l.assessmentCount}`}</span>
                  </div>
                  <Divider />
                  <div className="flex items-center">
                    <span>{`Contagens Selecionadas: ${l.tallysIds.length}/${l.tallyCount}`}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <CButton
                    variant="text"
                    onClick={() => {
                      setSelectedLocation(l);
                      setOpenLocationParamsDialog(true);
                    }}
                  >
                    <IconPencil />
                  </CButton>
                  <CButton
                    variant="text"
                    onClick={() => {
                      handleSelectedLocationsRemoval(l.id);
                    }}
                  >
                    <IconMinus />
                  </CButton>
                </div>
              </div>
            </div>
          );
        }}
      />
      <Divider />
      <div className="flex w-fit max-w-full flex-col gap-1">
        <CButton
          sx={{ width: "100%" }}
          loading={loadingExport.registrationsData}
          onClick={() => {
            handleRegistrationDataExport().catch(() => ({ statusCode: 1 }));
          }}
        >
          {"Exportar dados de cadastro"}
        </CButton>
        <PermissionGuard requiresAnyRoleGroups={["ASSESSMENT"]}>
          <CButton
            sx={{ width: "100%" }}
            loading={loadingExport.evaluations}
            onClick={() => {
              handleEvaluationExport().catch(() => ({ statusCode: 1 }));
            }}
          >
            {"Exportar avaliações físicas"}
          </CButton>
        </PermissionGuard>
        <PermissionGuard requiresAnyRoleGroups={["TALLY"]}>
          <CButton
            sx={{ width: "100%" }}
            loading={loadingExport.tallys}
            onClick={() => {
              handleIndividualTallysToExport().catch(() => ({
                statusCode: 1,
              }));
            }}
          >
            {"Exportar contagens individuais"}
          </CButton>
        </PermissionGuard>
        <PermissionGuard requiresAnyRoleGroups={["TALLY"]}>
          <CButton
            sx={{ width: "100%" }}
            loading={loadingExport.dailyTallys}
            onClick={() => {
              handleTallysExport().catch(() => ({
                statusCode: 1,
              }));
            }}
          >
            {"Exportar contagens por dia"}
          </CButton>
        </PermissionGuard>
      </div>
      <LocationParamsDialog
        open={openLocationParamsDialog}
        onClose={() => {
          setOpenLocationParamsDialog(false);
        }}
        location={selectedLocation}
        handleSelectedLocationObjChange={handleSelectedLocationObjChange}
      />
    </div>
  );

  if (isMobileView) {
    return (
      <CDialog
        fullScreen
        title="Menu de exportação"
        open={openDialog}
        onClose={handleDialogClose}
      >
        {innerComponent}
      </CDialog>
    );
  } else {
    return innerComponent;
  }
};

export default SelectedParks;
