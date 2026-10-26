"use client";

import LocationParamsDialog from "@/app/admin/export/locationParamsDialog";
import CButton from "@/components/ui/cButton";
import CIconChip from "@/components/ui/cIconChip";
import CDialog from "@/components/ui/dialog/cDialog";
import CLocationAdministrativeUnits from "@/components/ui/location/cLocationAdministrativeUnits";
import { downloadCSVFileFromText } from "@/lib/downloadFile";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import {
  useExportAssessments,
  useExportRegistrationData,
} from "@/lib/serverFunctions/apiCalls/export";
import PermissionGuard from "@components/auth/permissionGuard";
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
  const { enqueueSnackbar } = useAppSnackbar();
  const [loadingExport, setLoadingExport] = useState({
    registrationsData: false,
    evaluations: false,
  });
  const [exportRegistrationData] = useExportRegistrationData();
  const [exportAssessments] = useExportAssessments();

  const handleRegistrationDataExport = async () => {
    setLoadingExport((prev) => ({ ...prev, registrationsData: true }));
    const locationsIds = selectedLocationsObjs.map((location) => location.id);
    const result = await exportRegistrationData({
      data: { locationsIds },
    });
    const response = result.data ?? { CSVstring: null };
    if (result.responseInfo.statusCode === 401) {
      enqueueSnackbar(<>Sem permissão para exportar dados de praças!</>, {
        variant: "error",
      });
      setLoadingExport((prev) => ({ ...prev, registrationsData: false }));
      return;
    } else if (result.responseInfo.statusCode === 500) {
      enqueueSnackbar(<>Erro exportar dados de praças!</>, {
        variant: "error",
      });
      setLoadingExport((prev) => ({ ...prev, registrationsData: false }));
      return;
    }
    const csvString = response.CSVstring;
    if (csvString) {
      try {
        await downloadCSVFileFromText({
          filename: "Informações-Cadastro.csv",
          content: csvString,
        });

        enqueueSnackbar(<>Dados de praças exportados!</>, {
          variant: "success",
        });
      } catch (e) {
        enqueueSnackbar(
          <>Não foi possível salvar o arquivo no dispositivo!</>,
          { variant: "error" },
        );
      } finally {
        setLoadingExport((prev) => ({ ...prev, registrationsData: false }));
      }
    }
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
    const response = result.data ?? { csvObjs: [] };
    if (result.responseInfo.statusCode === 401) {
      enqueueSnackbar(<>Sem permissão para exportar avaliações!</>, {
        variant: "error",
      });
      setLoadingExport((prev) => ({ ...prev, evaluations: false }));
      return;
    } else if (result.responseInfo.statusCode === 500) {
      enqueueSnackbar(<>Erro exportar avaliações!</>, { variant: "error" });
      setLoadingExport((prev) => ({ ...prev, evaluations: false }));
      return;
    }
    const csvObjs = response.csvObjs;
    for (const csvObj of csvObjs) {
      try {
        await downloadCSVFileFromText({
          filename: `Avaliações - ${csvObj.formName}.csv`,
          content: csvObj.csvString,
        });
      } catch (e) {
        enqueueSnackbar(
          <>Não foi possível salvar o arquivo no dispositivo!</>,
          { variant: "error" },
        );
        setLoadingExport((prev) => ({ ...prev, evaluations: false }));
        return;
      }
    }
    enqueueSnackbar(<>Avaliações exportadas!</>, { variant: "success" });
    setLoadingExport((prev) => ({ ...prev, evaluations: false }));
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
