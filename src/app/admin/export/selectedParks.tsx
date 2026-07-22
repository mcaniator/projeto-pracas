"use client";

import LocationParamsDialog from "@/app/admin/export/locationParamsDialog";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import CDialog from "@/components/ui/dialog/cDialog";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import { downloadCSVFileFromText } from "@/lib/downloadFile";
import {
  useExportAssessments,
  useExportDailyTallys,
  useExportIndividualTallysToCSV,
  useExportRegistrationData,
} from "@/lib/serverFunctions/apiCalls/export";
import PermissionGuard from "@components/auth/permissionGuard";
import { useHelperCard } from "@components/context/helperCardContext";
import { Divider } from "@mui/material";
import {
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
  openLocationParamsDialog,
  selectedLocation,
  handleSelectedLocationsRemoval,
  handleSelectedLocationObjChange,
  handleOpenLocationParamsDialog,
  handleCloseLocationParamsDialog,
  handleDialogClose,
}: {
  selectedLocationsObjs: SelectedLocationObj[];
  isMobileView: boolean;
  openDialog: boolean;
  openLocationParamsDialog: boolean;
  selectedLocation: SelectedLocationObj | null;
  handleSelectedLocationsRemoval: (id: number) => void;
  handleSelectedLocationObjChange: (locationObj: SelectedLocationObj) => void;
  handleOpenLocationParamsDialog: (location: SelectedLocationObj) => void;
  handleCloseLocationParamsDialog: () => void;
  handleDialogClose: () => void;
}) => {
  const { setHelperCard } = useHelperCard();
  const [loadingExport, setLoadingExport] = useState({
    registrationsData: false,
    evaluations: false,
    tallys: false,
    dailyTallys: false,
  });
  const [exportRegistrationData] = useExportRegistrationData();
  const [exportAssessments] = useExportAssessments();
  const [exportDailyTallys] = useExportDailyTallys();
  const [exportIndividualTallysToCSV] = useExportIndividualTallysToCSV();

  const handleRegistrationDataExport = async () => {
    setLoadingExport((prev) => ({ ...prev, registrationsData: true }));
    const locationsIds = selectedLocationsObjs.map((location) => location.id);
    const result = await exportRegistrationData({
      data: { locationsIds },
    });
    const response = result.data ?? {
      statusCode: result.responseInfo.statusCode,
      CSVstring: null,
    };
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
      await downloadCSVFileFromText({
        filename: "Informações-Cadastro.csv",
        content: csvString,
      });
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
      (location) => location.assessmentsIds.length > 0,
    );
    const assessmentIds = locationsToExportEvaluations
      .map((location) => location.assessmentsIds)
      .flat();
    const result = await exportAssessments({
      data: { assessmentIds },
    });
    const response = result.data ?? {
      statusCode: result.responseInfo.statusCode,
      csvObjs: [],
    };
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
      await downloadCSVFileFromText({
        filename: `Avaliações - ${csvObj.formName}.csv`,
        content: csvObj.csvString,
      });
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
    const result = await exportDailyTallys({
      data: {
        locationIds: locationsToExportTallys.map((location) => location.id),
        tallysIds,
      },
    });
    const response = result.data ?? {
      statusCode: result.responseInfo.statusCode,
      CSVstringWeekdays: [],
      CSVstringWeekendDays: [],
    };
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
          await downloadCSVFileFromText({
            filename: `Contagem-Semana-Dia${i + 1}.csv`,
            content: csvString,
          });
        }
      }
    }
    if (csvObj.CSVstringWeekendDays) {
      for (let i = 0; i < csvObj?.CSVstringWeekendDays.length; i++) {
        const csvString = csvObj.CSVstringWeekendDays[i];
        if (csvString) {
          await downloadCSVFileFromText({
            filename: `Contagem-FimSemana-Dia${i + 1}.csv`,
            content: csvString,
          });
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
    const result = await exportIndividualTallysToCSV({
      data: { tallysIds },
    });
    const response = result.data ?? {
      statusCode: result.responseInfo.statusCode,
      CSVstring: null,
    };
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
      await downloadCSVFileFromText({
        filename: "Contagens individuais.csv",
        content: csvString,
      });
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

                  <CLocationAdministrativeUnits location={l} topDivider />

                  <Divider />
                  <div className="flex items-center">
                    <span>{`Avaliações selecionadas: ${l.assessmentsIds.length}/${l.assessmentCount}`}</span>
                  </div>
                  <Divider />
                  <div className="flex items-center">
                    <span>{`Contagens Selecionadas: ${l.tallysIds.length}/${l.tallyCount}`}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <CButton
                    square
                    onClick={() => {
                      handleOpenLocationParamsDialog(l);
                    }}
                  >
                    <IconPencil />
                  </CButton>
                  <CButton
                    square
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
        onClose={handleCloseLocationParamsDialog}
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
