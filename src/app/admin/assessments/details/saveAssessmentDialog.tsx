"use client";

import { useUserContext } from "@/components/context/UserContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";
import {
  adminSQLiteAssessmentSubmit,
  createAdminSQLiteAssessmentFromRemoteAssessment,
} from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import dayjs from "@/lib/dayjs";
import { downloadBlob } from "@/lib/downloadFile";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { useAssessmentSubmit } from "@/lib/serverFunctions/apiCalls/assessment";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { Capacitor } from "@capacitor/core";
import { IconAlertSquare } from "@tabler/icons-react";
import { Dayjs } from "dayjs";
import JSZip from "jszip";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

import {
  deleteAssessmentResponsesDraft,
  saveAssessmentResponsesDraft,
} from "./responseFormUtil";

const SaveAssessmentDialog = ({
  open,
  locationName,
  assessmentId,
  serializedFormValues,
  geometries,
  isFinalized,
  endDate,
  startDate,
  driveFolderUrl,
  locationId,
  formId,
  savedUpdatedAt,
  canSaveOffline,
  isSQLiteAssessment,
  onSaveSuccess,
  onIsFinalizedChange,
  onEndDateChange,
  onIsSQLiteAssessmentChange,
  onClose,
}: {
  open: boolean;
  locationName: string;
  assessmentId: number;
  serializedFormValues: SerializedFormValues;
  geometries: ResponseFormGeometry[];
  isFinalized: boolean;
  endDate: Dayjs | null;
  startDate: Dayjs;
  driveFolderUrl: string | null;
  locationId: number;
  formId: number;
  savedUpdatedAt: Date;
  canSaveOffline: boolean;
  isSQLiteAssessment: boolean;
  onSaveSuccess: (newSavedUpdatedAt: Date) => void;
  onIsFinalizedChange: (newIsFinalized: boolean) => void;
  onEndDateChange: (newEndDate: Dayjs | null) => void;
  onIsSQLiteAssessmentChange?: (newIsSQLiteAssessment: boolean) => void;
  onClose: () => void;
}) => {
  const [errorOnServerSave, setErrorOnServerSave] = useState(false);
  const [errorOnLocalSave, setErrorOnLocalSave] = useState(false);
  const [showDatePickerError, setShowDatePickerError] = useState(false);
  const { isConnected } = useNetwork();
  const router = useRouter();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { enqueueSnackbar } = useAppSnackbar();
  const { user } = useUserContext();
  const [serverSubmitAssessment] = useAssessmentSubmit({
    callbacks: {
      onSuccess: (response) => {
        // Delete local data, as it is no longer need
        // TODO: Refresh server data in ResponseFormV2

        deleteAssessmentResponsesDraft(assessmentId)
          .then(() => {
            if (response.data?.savedAsFinalized) {
              router.push(`/admin/assessments`);
            }
          })
          .catch(() => {
            enqueueSnackbar(
              <>Avaliação salva, mas falha ao excluir do dispositivo!</>,
              { variant: "error" },
            );
          })
          .finally(() => {
            setErrorOnServerSave(false);
            if (!response.data) {
              throw new Error(
                "Avaliação salva, mas a data de atualização não foi retornada!",
              );
            }
            onSaveSuccess(response.data.updatedAt);
          });
      },
      onError: () => {
        setErrorOnServerSave(true);
      },
      onServerError: () => {
        const saveOffline = async () => {
          if (Capacitor.isNativePlatform() && canSaveOffline) {
            // Saving assessment on SQLite, so the user is guaranteed that the data won't be lost
            await createAdminSQLiteAssessmentFromRemoteAssessment({
              data: {
                id: assessmentId,
                startDate: startDate.toDate(),
                endDate: endDate?.toDate() ?? null,
                isFinalized: isFinalized,
                isPublic: false,
                driveFolderUrl: driveFolderUrl,
                locationId: locationId,
                formId: formId,
              },
            });
            const offlineSaveResponse = await adminSQLiteAssessmentSubmit({
              data: {
                assessmentId,
                formSubmission: {
                  responses: serializedFormValues,
                  geometries,
                },
                startDate: startDate.toDate(),
                endDate: endDate?.toDate() ?? null,
                isFinalized: isFinalized,
                driveFolderUrl: driveFolderUrl,
              },
            });

            if (!offlineSaveResponse.data) {
              enqueueSnackbar("Erro ao salvar avaliação no dispostivo!", {
                variant: "error",
              });
              return;
            }

            await deleteAssessmentResponsesDraft(assessmentId);
            onSaveSuccess(offlineSaveResponse.data.updatedAt);
            onIsSQLiteAssessmentChange?.(true);

            if (offlineSaveResponse.data?.savedAsFinalized) {
              router.push(`/admin/assessments`);
            }
          }
        };
        void saveOffline();
      },
    },
  });
  const save = async () => {
    if (isFinalized && !endDate) {
      setShowDatePickerError(true);
      return;
    }

    setLoadingOverlay({ show: true, message: "Salvando avaliação..." });

    try {
      // Save locally, to not lose data if something goes wrong in the server
      await saveAssessmentResponsesDraft({
        id: assessmentId,
        userId: user.id,
        username: user.username,
        savedUpdatedAt,
        draftUpdatedAt: new Date(),
        isFinalized: isFinalized,
        startDate: startDate.toDate(),
        endDate: endDate?.toDate() ?? null,
        driveFolderUrl: driveFolderUrl,
        responseFormValues: serializedFormValues,
        geometries: geometries,
      });
      setErrorOnLocalSave(false);
    } catch (e) {
      enqueueSnackbar("Erro salvar ao respostas no dispositivo!", {
        variant: "error",
      });
      setErrorOnLocalSave(true);
      setLoadingOverlay({ show: false });
      return;
    }

    try {
      let funcIsSQLiteAssessment = isSQLiteAssessment;
      if (!isConnected && !isSQLiteAssessment && canSaveOffline) {
        await createAdminSQLiteAssessmentFromRemoteAssessment({
          data: {
            id: assessmentId,
            startDate: startDate.toDate(),
            endDate: endDate?.toDate() ?? null,
            isFinalized: isFinalized,
            isPublic: false,
            driveFolderUrl: driveFolderUrl,
            locationId: locationId,
            formId: formId,
          },
        });
        funcIsSQLiteAssessment = true;
        onIsSQLiteAssessmentChange?.(true);
      }
      if (!funcIsSQLiteAssessment) {
        if (isConnected) {
          await serverSubmitAssessment({
            data: {
              assessmentId,
              formSubmission: {
                responses: serializedFormValues,
                geometries,
              },
              startDate: startDate.toDate(),
              endDate: endDate?.toDate() ?? null,
              isFinalized: isFinalized,
              driveFolderUrl: driveFolderUrl,
            },
          });
        } else {
          enqueueSnackbar("Respostas salvas como rascunho!", {
            variant: "info",
          });
        }
      } else {
        const offlineSaveResponse = await adminSQLiteAssessmentSubmit({
          data: {
            assessmentId,
            formSubmission: {
              responses: serializedFormValues,
              geometries,
            },
            startDate: startDate.toDate(),
            endDate: endDate?.toDate() ?? null,
            isFinalized: isFinalized,
            driveFolderUrl: driveFolderUrl,
          },
        });
        if (!offlineSaveResponse.data) {
          enqueueSnackbar("Erro ao salvar avaliação no dispostivo!", {
            variant: "error",
          });
          return;
        }
        await deleteAssessmentResponsesDraft(assessmentId);
        onSaveSuccess(offlineSaveResponse.data.updatedAt);

        if (offlineSaveResponse.data.savedAsFinalized) {
          router.push(`/admin/assessments`);
        }
        enqueueSnackbar("Avaliação salva no dispostivo!", {
          variant: "success",
        });
      }
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  const generateExport = async () => {
    setLoadingOverlay({ show: true, message: "Gerando arquivo da avaliação" });
    try {
      const zip = new JSZip();
      const data = {
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString() ?? null,
        isFinalized: isFinalized,
        assessmentId: assessmentId,
        responses: serializedFormValues,
        geometries: geometries,
        driveFolderUrl: driveFolderUrl,
      };

      zip.file("assessment.json", JSON.stringify(data, null, 2));
      const blob = await zip.generateAsync({
        type: "blob",
      });

      const filename = `avaliação_${locationName}_${new Date().toISOString()}.zip`;

      await downloadBlob({
        filename,
        mimeType: "application/zip",
        blob,
      });
    } catch (e) {
      enqueueSnackbar("Erro ao gerar arquivo da avaliação!", {
        variant: "error",
      });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  useEffect(() => {
    if (open) {
      setErrorOnServerSave(false);
      setErrorOnLocalSave(false);
      setShowDatePickerError(false);
    }
  }, [open]);

  useEffect(() => {
    if (isFinalized && !endDate) {
      onEndDateChange(dayjs(new Date()));
    }
  }, [isFinalized, endDate, onEndDateChange]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title={"Salvar avaliação"}
      cancelChildren={"Exportar"}
      confirmChildren={errorOnServerSave ? "Tentar novamente" : "Salvar"}
      onConfirm={() => {
        void save();
      }}
      onCancel={() => {
        void generateExport();
      }}
    >
      <div className="flex w-full flex-col gap-1">
        {(errorOnServerSave || errorOnLocalSave) && (
          <div className="flex w-full flex-col gap-1">
            <p className="text-red-500">
              {"Ocorreu um erro ao salvar a avaliação no servidor."}
            </p>
            {errorOnLocalSave ?
              <p className="text-red-500">
                {
                  "Os dados da avaliação não foram salvos neste navegador. Exporte a avaliação para não perder os dados."
                }
              </p>
            : <p>
                {
                  "Os dados da avaliação foram salvos neste navegador. Ao acessar esta avaliação novamente por este navegador, os dados serão carregados."
                }
              </p>
            }
            <p>
              {
                ' Caso deseje tentar novamente, clique em "Tentar novamente". Caso deseje exportar os dados desta avaliação, clique em "Exportar".'
              }
            </p>
          </div>
        )}
        {!canSaveOffline && !isConnected && (
          <div className="flex w-full flex-col items-center gap-1">
            <IconAlertSquare className="text-red-500" />
            <p className="text-red-500">
              {
                "Após sair desta página, você não poderá acessar esta avaliação enquanto estiver offline."
              }
            </p>
          </div>
        )}
        <CSwitch
          checked={isFinalized}
          label="Salvar como finalizado"
          onChange={(e) => {
            onIsFinalizedChange(e.target.checked);
          }}
        />
        <CDateTimePicker
          value={endDate}
          error={showDatePickerError}
          clearable
          onChange={(e) => {
            setShowDatePickerError(false);
            onEndDateChange(e);
          }}
          label="Data final"
        />
      </div>
    </CDialog>
  );
};

export default SaveAssessmentDialog;
