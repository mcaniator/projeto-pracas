import AssessmentResultDialog from "@/app/admin/assessments/assessmentResultDialog";
import CancelAssessmentSyncDialog from "@/app/admin/assessments/cancelAssessmentSyncDialog";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CButton from "@/components/ui/cButton";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import {
  deleteAdminSQLiteAssessment,
  fetchAdminSQLiteAssessmentTableData,
  fetchAdminSQLiteAssessmentTree,
} from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import {
  useAddResponses,
  useCreateAssessment,
  useUpdateAssessmentVisibility,
} from "@/lib/serverFunctions/apiCalls/assessment";
import { Capacitor } from "@capacitor/core";
import { Chip, Divider } from "@mui/material";
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconClipboard,
  IconCloudX,
  IconDeviceFloppy,
  IconExternalLink,
  IconEye,
  IconFilePencil,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Virtuoso } from "react-virtuoso";

import CIconChip from "../../../components/ui/cIconChip";
import { dateTimeFormatter } from "../../../lib/formatters/dateFormatters";
import type { AssessmentWithSyncStatus } from "./assessmentsClient";

const AssessmentsList = ({
  assessments,
  hasSQLiteAssessments,
  handleVisibilityChange,
  fetchAssessments,
}: {
  assessments: AssessmentWithSyncStatus[];
  hasSQLiteAssessments: boolean;
  handleVisibilityChange: (id: number, isPublic: boolean) => void;
  fetchAssessments: () => void;
}) => {
  const { isConnected, isConnectedRef } = useNetwork();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [pendingVisibilityChange, setPendingVisibilityChange] = useState<{
    id: number;
    locationName: string;
    isPublic: boolean;
  }>();

  const [pendingCancelAssessmentSync, setPendingCancelAssessmentSync] =
    useState<AssessmentWithSyncStatus | null>(null);

  const [selectedAssessmentToView, setSelectedAssessmentToView] =
    useState<AssessmentWithSyncStatus | null>(null);

  const [createAssessmentOnServer] = useCreateAssessment({
    disableOfflineFallback: true,
  });
  const [addResponsesOnServer] = useAddResponses(); //This hook does not have offline fallback
  const [updateVisibility, updatingVisibility] = useUpdateAssessmentVisibility({
    callbacks: {
      onSuccess: () => {
        if (pendingVisibilityChange === undefined) {
          return;
        }

        handleVisibilityChange(
          pendingVisibilityChange.id,
          pendingVisibilityChange.isPublic,
        );
        setPendingVisibilityChange(undefined);
      },
      onError: () => {
        setPendingVisibilityChange(undefined);
      },
    },
  });

  const assessmentSync = async (assessment: AssessmentWithSyncStatus) => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (isConnectedRef.current === false) {
      enqueueSnackbar("Sem conexão!", {
        variant: "error",
      });
      return;
    }

    if (assessment.hasPendingSaveFromDraft) {
      enqueueSnackbar("Salve as respostas antes de sincronizar!", {
        variant: "error",
      });
      return;
    }
    try {
      setLoadingOverlay({ show: true, message: "Sincronizando avaliação..." });
      const assessmentTableDataResponse =
        await fetchAdminSQLiteAssessmentTableData({
          params: {
            assessmentId: assessment.id,
          },
        });
      const SQLiteAssessmentTableData = assessmentTableDataResponse.data;
      if (!SQLiteAssessmentTableData) {
        enqueueSnackbar("Avaliação não encontrada no dispositivo!", {
          variant: "error",
        });
        return;
      }
      let serverAssessmentId = SQLiteAssessmentTableData.id; // We initialize with the local id. If it is an existing assessment, it will aleady be correct. Otherwise, we will create a new one on the server and update the variable.
      if (SQLiteAssessmentTableData.createdLocally) {
        //Create the assessment on the server
        const createAssessmentResponse = await createAssessmentOnServer({
          data: {
            locationId: SQLiteAssessmentTableData.locationId,
            startDate: SQLiteAssessmentTableData.startDate,
            formId: SQLiteAssessmentTableData.formId,
            endDate: SQLiteAssessmentTableData.endDate,
            isFinalized: SQLiteAssessmentTableData.isFinalized,
            driveFolderUrl: SQLiteAssessmentTableData.driveFolderUrl,
            createdAt: SQLiteAssessmentTableData.createdAt,
            updatedAt: SQLiteAssessmentTableData.updatedAt,
          },
        });
        if (!createAssessmentResponse.data?.assessmentId) {
          enqueueSnackbar("Erro ao criar avaliação!", {
            variant: "error",
          });
          return;
        }
        serverAssessmentId = createAssessmentResponse.data.assessmentId;
      }
      // Fetch responses from SQLite and send them to the server
      const SQLiteAssessmentTree = await fetchAdminSQLiteAssessmentTree({
        params: {
          assessmentId: assessment.id,
        },
      });
      const SQLiteAssessmentTreeData =
        SQLiteAssessmentTree.data?.assessmentTree;
      if (!SQLiteAssessmentTreeData) {
        enqueueSnackbar(
          "Respostas da avaliação não encontradas no dispositivo!",
          {
            variant: "error",
          },
        );
        return;
      }
      await addResponsesOnServer({
        data: {
          assessmentId: serverAssessmentId,
          startDate: SQLiteAssessmentTreeData.startDate,
          endDate: SQLiteAssessmentTreeData.endDate,
          isFinalized: SQLiteAssessmentTreeData.isFinalized,
          driveFolderUrl: SQLiteAssessmentTreeData.driveFolderUrl,
          geometries: SQLiteAssessmentTreeData.geometries,
          responses: SQLiteAssessmentTreeData.responsesFormValues,
        },
      });

      //Delete local data, as it is no longer need
      await deleteAdminSQLiteAssessment({
        data: {
          assessmentId: assessment.id,
        },
      });

      //Refresh the list
      fetchAssessments();
    } catch (e) {
      enqueueSnackbar("Erro ao sincronizar!", { variant: "error" });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  return (
    <div className="flex h-full flex-col gap-1">
      {assessments.length === 0 && (
        <div className="text-center text-xl font-semibold">
          Nenhuma avaliação corresponde aos filtros!
        </div>
      )}
      {hasSQLiteAssessments && (
        <div className="text-center font-semibold">
          <Chip
            icon={<IconAlertTriangle />}
            label="Há avaliações salvas localmente!"
            color="warning"
          />
          <p>
            É necessário enviar as avaliações do dispositivo ao servidor para
            ver todas as outras.
          </p>
        </div>
      )}
      <Virtuoso
        data={assessments}
        style={{ height: "100%", overflowX: "hidden", minHeight: "300px" }}
        itemContent={(_, a) => {
          return (
            <div className="pb-4">
              <div
                key={a.id}
                className="flex flex-row justify-between bg-gray-200 p-2 px-2 shadow-xl"
              >
                <div className="flex h-auto w-full flex-col gap-1">
                  <span className="flex flex-wrap items-center break-all text-lg font-semibold sm:text-2xl">
                    <CIconChip
                      icon={<IconFilePencil />}
                      tooltip="Avaliação - Praça"
                    />
                    {hasSQLiteAssessments ?
                      `${a.location.name}`
                    : `${a.id} - ${a.location.name}`}
                    <Chip
                      sx={{ ml: 2 }}
                      color={a.isFinalized ? "secondary" : "warning"}
                      label={a.isFinalized ? "Finalizado" : "Em progresso"}
                    />
                  </span>
                  <Divider />
                  {a.hasPendingSaveFromDraft && (
                    <>
                      <span className="flex items-center text-base sm:text-xl">
                        <Chip
                          icon={<IconDeviceFloppy />}
                          label="Respostas não salvas!"
                          color="error"
                        />
                      </span>
                      <Divider />
                    </>
                  )}
                  <span className="flex items-center text-base sm:text-xl">
                    <CIconChip icon={<IconClipboard />} tooltip="Fomulário" />
                    {a.form.name}
                  </span>
                  <Divider />
                  <span className="flex items-center text-base sm:text-xl">
                    <CIconChip
                      icon={<IconCalendar />}
                      tooltip={a.endDate ? "Início - Fim" : "Início"}
                    />
                    {`${dateTimeFormatter.format(a.startDate)} ${a.endDate ? `- ${dateTimeFormatter.format(a.endDate)}` : ""}`}
                  </span>
                  <Divider />
                  <span className="flex items-center text-base sm:text-xl">
                    <CIconChip icon={<IconUser />} tooltip="Responsável" />
                    {a.user.username}
                  </span>
                  <Divider />
                  <span className="flex items-center gap-2 text-base sm:text-xl">
                    {(
                      !a.hasPendingSaveFromDraft &&
                      a.isFinalized &&
                      !hasSQLiteAssessments
                    ) ?
                      <CButton
                        square
                        onClick={() => {
                          setSelectedAssessmentToView(a);
                        }}
                      >
                        <IconEye /> Resultados
                      </CButton>
                    : <CButton
                        square
                        loadingOnClick
                        href={`/admin/assessments/details?assessmentId=${a.id}${Capacitor.isNativePlatform() ? `&isSQLiteAssessment=${hasSQLiteAssessments}` : ``}`}
                      >
                        <IconExternalLink />
                        Acessar
                      </CButton>
                    }

                    <Divider orientation="vertical" />
                    {hasSQLiteAssessments ?
                      <div className="flex items-center gap-2">
                        <CButton
                          square
                          onClick={() => {
                            void assessmentSync(a);
                          }}
                        >
                          <IconUpload /> Sincronizar
                        </CButton>
                        <CButton
                          square
                          color="error"
                          onClick={() => {
                            setPendingCancelAssessmentSync(a);
                          }}
                        >
                          <IconCloudX />
                        </CButton>
                      </div>
                    : <CSwitch
                        checked={
                          pendingVisibilityChange?.id === a.id ?
                            pendingVisibilityChange.isPublic
                          : a.isPublic
                        }
                        disabled={a.hasPendingSaveFromDraft || !a.isFinalized}
                        tooltip={
                          !isConnected ? "Nao conectado ao servidor!"
                          : hasSQLiteAssessments ?
                            "Não é possível alterar a visibilidade de uma avaliação não enviada!"
                          : a.hasPendingSaveFromDraft ?
                            "Não é possível alterar a visibilidade de uma avaliação com respostas nao enviadas!"
                          : !a.isFinalized ?
                            "A avaliação ainda nao foi finalizada!"
                          : ""
                        }
                        label="Visível publicamente"
                        onChange={(e) => {
                          setPendingVisibilityChange({
                            id: a.id,
                            locationName: a.location.name,
                            isPublic: e.target.checked,
                          });
                        }}
                      />
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        }}
      />
      <CDialog
        title="Alterar visibilidade"
        open={!!pendingVisibilityChange}
        onClose={() => {
          setPendingVisibilityChange(undefined);
        }}
        confirmChildren={<IconCheck />}
        confirmLoading={updatingVisibility}
        onConfirm={() => {
          void updateVisibility({
            data: {
              assessmentId: pendingVisibilityChange!.id,
              isPublic: pendingVisibilityChange!.isPublic,
            },
          });
        }}
      >
        <div>
          {pendingVisibilityChange?.isPublic ?
            "Deixar esta avaliação visível publicamente?"
          : "Ocultar publicamente esta avaliação?"}
        </div>
        <div className="font-semibold">{`${pendingVisibilityChange?.locationName} - ${pendingVisibilityChange?.id}`}</div>
      </CDialog>
      <AssessmentResultDialog
        open={!!selectedAssessmentToView}
        onClose={() => setSelectedAssessmentToView(null)}
        assessment={selectedAssessmentToView}
        isSQLiteAssessment={hasSQLiteAssessments}
      />
      <CancelAssessmentSyncDialog
        assessment={pendingCancelAssessmentSync}
        onClose={() => {
          setPendingCancelAssessmentSync(null);
        }}
        onDeletion={() => {
          void fetchAssessments();
        }}
      />
    </div>
  );
};

export default AssessmentsList;
