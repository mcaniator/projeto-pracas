"use client";

import AssessmentImportDataDialog from "@/app/admin/assessments/details/assessmentImportDataDialog";
import ChooseResponsesSourceDialog from "@/app/admin/assessments/details/chooseResponsesSourceDialog";
import DeleteAssessmentDialog from "@/app/admin/assessments/details/deleteAssessmentDialog";
import DriveFolderUrlDialog from "@/app/admin/assessments/details/driveFolderUrlDialog";
import {
  deleteAssessmentResponsesDraft,
  fetchAssessmentResponsesDraft,
  saveAssessmentResponsesDraft,
} from "@/app/admin/assessments/details/responseFormUtil";
import RevertAssessmentDraftDialog from "@/app/admin/assessments/details/revertAssessmentDraftDialog";
import SaveAssessmentDialog from "@/app/admin/assessments/details/saveAssessmentDialog";
import { useUserContext } from "@/components/context/UserContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CChip from "@/components/ui/cChip";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CHelpChip from "@/components/ui/cHelpChip";
import ResponseFormV2, {
  type ResponseFormGeometriesChange,
  type ResponseFormV2Handle,
  type ResponseFormValuesChange,
} from "@/components/ui/responseForm/responseFormV2";
import dayjs from "@/lib/dayjs";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import type { FetchAssessmentDetailsResponse } from "@/lib/serverFunctions/queries/assessment";
import type { AssessmentDraft } from "@/lib/types/assessments/assessmentDraft";
import type { SerializedFormValues } from "@/lib/types/formSubmission/responseFormTypes";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  IconArrowBackUp,
  IconBrandGoogleDrive,
  IconClipboard,
  IconClipboardCheck,
  IconClipboardData,
  IconDeviceFloppy,
  IconFileUpload,
  IconListCheck,
  IconPencil,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { assessmentImportDataSchema } from "@zodValidators";
import type { Dayjs } from "dayjs";
import JSZip from "jszip";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const AssessmentClient = ({
  locationId,
  locationName,
  locationPolygonGeoJson,
  assessmentDetails,
  finalized,
  userCanEdit,
  canSaveOffline,
  isSQLiteAssessment,
  onIsSQLiteAssessmentChange,
}: {
  locationId: number;
  locationName: string;
  locationPolygonGeoJson: string | null;
  assessmentDetails: FetchAssessmentDetailsResponse["assessmentDetails"];
  finalized: boolean;
  userCanEdit: boolean;
  canSaveOffline: boolean;
  isSQLiteAssessment: boolean;
  onIsSQLiteAssessmentChange: (value: boolean) => void;
}) => {
  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("lg"));
  const responseFormRef = useRef<ResponseFormV2Handle>(null);
  const { enqueueSnackbar } = useAppSnackbar();
  const { user } = useUserContext();
  const { setLoadingOverlay } = useLoadingOverlay();
  const formSubmission = assessmentDetails.formSubmission;

  const [openAssessmentImportDialog, setOpenAssessmentImportDialog] =
    useState(false);
  const [isFinalized, setIsFinalized] = useState(finalized);
  const [isFilling, setIsFilling] = useState(finalized ? false : userCanEdit);
  const [endDate, setEndDate] = useState<Dayjs | null>(
    assessmentDetails.endDate ? dayjs(assessmentDetails.endDate) : null,
  );
  const [startDate, setStartDate] = useState<Dayjs>(
    dayjs(assessmentDetails.startDate),
  );
  const [openDriveFolderUrlDialog, setOpenDriveFolderUrlDialog] =
    useState(false);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(
    assessmentDetails.driveFolderUrl,
  );
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteAssessmentDialog, setOpenDeleteAssessmentDialog] =
    useState(false);
  const [openRevertAssessmentDraftDialog, setOpenRevertAssessmentDraftDialog] =
    useState(false);
  const [pendingDraftAssessmentChoice, setPendingDraftAssessmentChoice] =
    useState<AssessmentDraft>();
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<Date>();
  const [pendingSave, setPendingSave] = useState(false);
  const [savedUpdatedAtState, setSavedUpdatedAtState] = useState(
    assessmentDetails.updatedAt,
  );

  const savedUpdatedAtRef = useRef(assessmentDetails.updatedAt);
  const geometriesRef = useRef(formSubmission.geometries);
  const serializedFormValuesRef = useRef<SerializedFormValues>(
    formSubmission.responsesFormValues,
  );
  const isDirtyRef = useRef(false);
  const draftSaveTimeoutRef = useRef<number | undefined>(undefined);

  const scheduleDraftSave = useCallback(() => {
    if (!isDirtyRef.current) {
      return;
    }

    setPendingSave(true);
    window.clearTimeout(draftSaveTimeoutRef.current);
    draftSaveTimeoutRef.current = window.setTimeout(() => {
      const assessmentDraft: AssessmentDraft = {
        id: assessmentDetails.id,
        userId: user.id,
        username: user.username,
        savedUpdatedAt: savedUpdatedAtRef.current,
        draftUpdatedAt: new Date(),
        isFinalized,
        startDate: startDate.toDate(),
        endDate: endDate?.toDate() ?? null,
        driveFolderUrl,
        responseFormValues: serializedFormValuesRef.current,
        geometries: geometriesRef.current,
      };

      void saveAssessmentResponsesDraft(assessmentDraft);
      setDraftUpdatedAt(assessmentDraft.draftUpdatedAt);
    }, 500);
  }, [
    assessmentDetails.id,
    driveFolderUrl,
    endDate,
    isFinalized,
    startDate,
    user.id,
    user.username,
  ]);

  const handleValuesChange = useCallback(
    ({ serializedValues, source }: ResponseFormValuesChange) => {
      serializedFormValuesRef.current = serializedValues;
      if (source === "user") {
        isDirtyRef.current = true;
        scheduleDraftSave();
      }
    },
    [scheduleDraftSave],
  );

  const handleGeometriesChange = useCallback(
    ({ geometries, source }: ResponseFormGeometriesChange) => {
      geometriesRef.current = geometries;
      if (source === "user") {
        isDirtyRef.current = true;
        scheduleDraftSave();
      }
    },
    [scheduleDraftSave],
  );

  const applyDraftAssessmentValues = useCallback(
    (assessmentDraft: AssessmentDraft) => {
      responseFormRef.current?.reset({
        responsesFormValues: assessmentDraft.responseFormValues,
        geometries: assessmentDraft.geometries,
      });
      serializedFormValuesRef.current = assessmentDraft.responseFormValues;
      setIsFinalized(assessmentDraft.isFinalized);
      setIsFilling(true);
      setStartDate(dayjs(assessmentDraft.startDate));
      setEndDate(
        assessmentDraft.endDate ? dayjs(assessmentDraft.endDate) : null,
      );
      setDriveFolderUrl(assessmentDraft.driveFolderUrl);
      geometriesRef.current = assessmentDraft.geometries;
      isDirtyRef.current = false;
      setPendingDraftAssessmentChoice(undefined);
      setPendingSave(true);
    },
    [],
  );

  const applySavedAssessmentValues = useCallback(() => {
    const applySavedValuesAndDeleteDraft = async () => {
      setLoadingOverlay({ show: true, message: "Carregando..." });
      responseFormRef.current?.reset({
        responsesFormValues: formSubmission.responsesFormValues,
        geometries: formSubmission.geometries,
      });
      serializedFormValuesRef.current = formSubmission.responsesFormValues;
      setIsFinalized(assessmentDetails.isFinalized);
      setIsFilling(!assessmentDetails.isFinalized);
      setStartDate(dayjs(assessmentDetails.startDate));
      setEndDate(
        assessmentDetails.endDate ? dayjs(assessmentDetails.endDate) : null,
      );
      setDriveFolderUrl(assessmentDetails.driveFolderUrl);
      geometriesRef.current = formSubmission.geometries;
      isDirtyRef.current = false;
      setPendingDraftAssessmentChoice(undefined);
      try {
        await deleteAssessmentResponsesDraft(assessmentDetails.id);
        setPendingSave(false);
        setDraftUpdatedAt(undefined);
      } catch {
        enqueueSnackbar("Erro ao remover dados locais!", {
          variant: "error",
        });
      } finally {
        if (assessmentDetails.isFinalized) {
          setIsFilling(false);
        }
        setLoadingOverlay({ show: false });
      }
    };

    void applySavedValuesAndDeleteDraft();
  }, [
    assessmentDetails,
    enqueueSnackbar,
    formSubmission.geometries,
    formSubmission.responsesFormValues,
    setLoadingOverlay,
  ]);

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const zip = await JSZip.loadAsync(file);
      const manifestFile = zip.file("assessment.json");
      if (!manifestFile) throw new Error("Manifesto não encontrado");

      const importedData = assessmentImportDataSchema.parse(
        JSON.parse(await manifestFile.async("string")),
      );
      responseFormRef.current?.reset({
        responsesFormValues: importedData.responses,
        geometries: importedData.geometries,
      });
      serializedFormValuesRef.current = importedData.responses;
      geometriesRef.current = importedData.geometries;
      setStartDate(dayjs(importedData.startDate));
      setEndDate(
        importedData.endDate && dayjs(importedData.endDate).isValid() ?
          dayjs(importedData.endDate)
        : null,
      );
      setIsFinalized(importedData.isFinalized);
      setDriveFolderUrl(importedData.driveFolderUrl);
      isDirtyRef.current = true;
      scheduleDraftSave();
      enqueueSnackbar(<>Avaliação importada!</>, { variant: "success" });
    } catch {
      enqueueSnackbar(<>Arquivo inválido!</>, { variant: "error" });
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadAssessmentDraft = async () => {
      try {
        setLoadingOverlay({
          show: true,
          message: "Carregando respostas locais...",
        });
        const assessmentDraft = await fetchAssessmentResponsesDraft(
          assessmentDetails.id,
        );

        if (ignore || !assessmentDraft) return;

        setDraftUpdatedAt(assessmentDraft.draftUpdatedAt);
        if (
          assessmentDetails.updatedAt.getTime() <=
          assessmentDraft.savedUpdatedAt.getTime()
        ) {
          applyDraftAssessmentValues(assessmentDraft);
          return;
        }

        setPendingDraftAssessmentChoice(assessmentDraft);
      } catch {
        enqueueSnackbar(<>Erro ao carregar respostas locais!</>, {
          variant: "error",
        });
      } finally {
        setLoadingOverlay({ show: false });
      }
    };

    void loadAssessmentDraft();
    return () => {
      ignore = true;
    };
  }, [
    applyDraftAssessmentValues,
    assessmentDetails.id,
    assessmentDetails.updatedAt,
    enqueueSnackbar,
    setLoadingOverlay,
  ]);

  useEffect(() => () => window.clearTimeout(draftSaveTimeoutRef.current), []);

  const responseFormHeader = (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
      <div className="flex flex-wrap gap-1">
        <CChip
          label={formSubmission.formStructure.formName}
          icon={<IconClipboard />}
          sx={{ fontSize: 16 }}
          tooltip="Formulário"
        />
        <CChip
          label={assessmentDetails.user.username}
          icon={<IconUser />}
          sx={{ fontSize: 16 }}
          tooltip="Avaliador"
        />
        {!isFilling && (
          <>
            <CChip
              icon={<IconClipboardData />}
              label={dateTimeFormatter.format(assessmentDetails.startDate)}
              sx={{ fontSize: 16 }}
              tooltip="Início"
            />
            <CChip
              icon={<IconClipboardCheck />}
              label={
                assessmentDetails.endDate ?
                  dateTimeFormatter.format(assessmentDetails.endDate)
                : "Indefinido"
              }
              sx={{ fontSize: 16 }}
              tooltip="Fim"
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isFilling && (
          <CDateTimePicker
            label="Início"
            value={startDate}
            onChange={(value) => {
              if (!value) return;
              isDirtyRef.current = true;
              setStartDate(value);
              scheduleDraftSave();
            }}
          />
        )}
        {!isFilling && userCanEdit && (
          <>
            <CHelpChip tooltip="Você possui permissão para editar esta avaliação finalizada." />
            <CButton square onClick={() => setIsFilling(true)}>
              <IconPencil />
            </CButton>
          </>
        )}
        <CButton
          square
          tooltip="Drive"
          enableTopLeftChip={!!driveFolderUrl}
          topLeftChipLabel="1"
          disabled={!isFilling && !driveFolderUrl}
          onClick={() => setOpenDriveFolderUrlDialog(true)}
        >
          <IconBrandGoogleDrive />
        </CButton>
        <CButton
          topLeftChipLabel="!"
          enableTopLeftChip={pendingSave}
          tooltip="Reverter alterações locais"
          square
          color={isFilling ? "warning" : undefined}
          disabled={!pendingSave}
          onClick={() => setOpenRevertAssessmentDraftDialog(true)}
        >
          <IconArrowBackUp />
        </CButton>
        {isFilling && (
          <CButton
            square
            tooltip="Excluir avaliação"
            color="error"
            onClick={() => setOpenDeleteAssessmentDialog(true)}
          >
            <IconTrash />
          </CButton>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader
        title={`Avaliação em ${locationName}`}
        titleIcon={<IconListCheck />}
        append={
          <CButton
            square={isMobileView}
            tooltip="Importar dados"
            onClick={() => setOpenAssessmentImportDialog(true)}
          >
            <IconFileUpload /> {isMobileView ? "" : "Importar"}
          </CButton>
        }
      />

      <div className="min-h-0 flex-1">
        <ResponseFormV2
          ref={responseFormRef}
          header={responseFormHeader}
          formSubmission={formSubmission}
          readOnly={!isFilling}
          locationPolygonGeoJson={locationPolygonGeoJson}
          onValuesChange={handleValuesChange}
          onGeometriesChange={handleGeometriesChange}
          onSubmit={() => {
            setOpenSaveDialog(true);
          }}
        />
      </div>

      {isFilling && (
        <CButton
          className="ml-auto mt-2 w-fit"
          enableTopLeftChip={pendingSave}
          topLeftChipLabel="!"
          onClick={() => responseFormRef.current?.submit()}
        >
          <IconDeviceFloppy />
          Salvar
        </CButton>
      )}

      <AssessmentImportDataDialog
        open={openAssessmentImportDialog}
        onClose={() => setOpenAssessmentImportDialog(false)}
        onFileInput={(event) => {
          setLoadingOverlay({ show: true, message: "Importando dados..." });
          void importData(event).finally(() => {
            setLoadingOverlay({ show: false });
          });
          setOpenAssessmentImportDialog(false);
        }}
      />
      <SaveAssessmentDialog
        locationName={locationName}
        assessmentId={assessmentDetails.id}
        open={openSaveDialog}
        serializedFormValues={serializedFormValuesRef.current}
        geometries={geometriesRef.current}
        endDate={endDate}
        isFinalized={isFinalized}
        startDate={startDate}
        driveFolderUrl={driveFolderUrl}
        locationId={locationId}
        formId={formSubmission.formStructure.formId}
        savedUpdatedAt={savedUpdatedAtRef.current}
        canSaveOffline={canSaveOffline}
        isSQLiteAssessment={isSQLiteAssessment}
        onSaveSuccess={(newUpdatedAt) => {
          savedUpdatedAtRef.current = newUpdatedAt;
          setSavedUpdatedAtState(newUpdatedAt);
          setPendingSave(false);
          isDirtyRef.current = false;
        }}
        onClose={() => setOpenSaveDialog(false)}
        onIsFinalizedChange={(value) => {
          isDirtyRef.current = true;
          setIsFinalized(value);
        }}
        onEndDateChange={(value) => {
          isDirtyRef.current = true;
          setEndDate(value);
        }}
        onIsSQLiteAssessmentChange={onIsSQLiteAssessmentChange}
      />
      <DeleteAssessmentDialog
        assessmentId={assessmentDetails.id}
        open={openDeleteAssessmentDialog}
        isSQLiteAssessment={isSQLiteAssessment}
        onClose={() => setOpenDeleteAssessmentDialog(false)}
      />
      <RevertAssessmentDraftDialog
        open={openRevertAssessmentDraftDialog}
        draftUpdatedAt={draftUpdatedAt}
        savedUpdatedAt={savedUpdatedAtState}
        onClose={() => setOpenRevertAssessmentDraftDialog(false)}
        onConfirm={() => {
          setOpenRevertAssessmentDraftDialog(false);
          applySavedAssessmentValues();
          enqueueSnackbar("Revertido com sucesso!", { variant: "success" });
        }}
      />
      <DriveFolderUrlDialog
        open={openDriveFolderUrlDialog}
        driveFolderUrl={driveFolderUrl}
        isFilling={isFilling}
        onClose={() => setOpenDriveFolderUrlDialog(false)}
        onConfirm={(url) => {
          isDirtyRef.current = true;
          setDriveFolderUrl(url);
          scheduleDraftSave();
        }}
      />
      {!!pendingDraftAssessmentChoice && (
        <ChooseResponsesSourceDialog
          savedSource={{
            updatedAt: assessmentDetails.updatedAt,
            username: assessmentDetails.user.username,
          }}
          draftSource={{
            updatedAt: pendingDraftAssessmentChoice.draftUpdatedAt,
            username: pendingDraftAssessmentChoice.username,
          }}
          applySavedAssessmentValues={applySavedAssessmentValues}
          applyDraftAssessmentValues={() =>
            applyDraftAssessmentValues(pendingDraftAssessmentChoice)
          }
        />
      )}
    </div>
  );
};

export default AssessmentClient;
