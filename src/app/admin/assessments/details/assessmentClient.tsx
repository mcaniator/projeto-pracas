"use client";

import AssessmentImportDataDialog from "@/app/admin/assessments/details/assessmentImportDataDialog";
import ChooseResponsesSourceDialog from "@/app/admin/assessments/details/chooseResponsesSourceDialog";
import DeleteAssessmentDialog from "@/app/admin/assessments/details/deleteAssessmentDialog";
import DriveFolderUrlDialog from "@/app/admin/assessments/details/driveFolderUrlDialog";
import {
  deleteAssessmentResponsesDraft,
  loadAssessmentResponsesDraft,
  saveAssessmentResponsesDraft,
} from "@/app/admin/assessments/details/responseFormUtil";
import RevertLocalAssessmentDialog from "@/app/admin/assessments/details/revertLocalAssessmentDialog";
import SaveAssessmentDialog from "@/app/admin/assessments/details/saveAssessmentDialog";
import { useUserContext } from "@/components/context/UserContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import CChip from "@/components/ui/cChip";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CHelpChip from "@/components/ui/cHelpChip";
import ResponseFormV2, {
  type ResponseFormV2Handle,
  type ResponseFormValuesChange,
} from "@/components/ui/responseForm/responseFormV2";
import dayjs from "@/lib/dayjs";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import type { FetchAssessmentTreeResponse } from "@/lib/serverFunctions/queries/assessment";
import type { AssessmentDraft } from "@/lib/types/assessments/assessmentDraft";
import type {
  ResponseFormGeometry,
  ResponseFormImages,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
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
  assessmentTree,
  finalized,
  userCanEdit,
  canSaveOffline,
  isSQLiteAssessment,
  onIsSQLiteAssessmentChange,
}: {
  locationId: number;
  locationName: string;
  locationPolygonGeoJson: string | null;
  assessmentTree: FetchAssessmentTreeResponse["assessmentTree"];
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
  const formSubmission = assessmentTree.formSubmission;

  const [openAssessmentImportDialog, setOpenAssessmentImportDialog] =
    useState(false);
  const [isFinalized, setIsFinalized] = useState(finalized);
  const [isFilling, setIsFilling] = useState(finalized ? false : userCanEdit);
  const [endDate, setEndDate] = useState<Dayjs | null>(
    assessmentTree.endDate ? dayjs(assessmentTree.endDate) : null,
  );
  const [startDate, setStartDate] = useState<Dayjs>(
    dayjs(assessmentTree.startDate),
  );
  const [openDriveFolderUrlDialog, setOpenDriveFolderUrlDialog] =
    useState(false);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(
    assessmentTree.driveFolderUrl,
  );
  const [geometries, setGeometries] = useState<ResponseFormGeometry[]>(
    formSubmission.geometries,
  );
  const [responseImages, setResponseImages] = useState<ResponseFormImages>({});
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openDeleteAssessmentDialog, setOpenDeleteAssessmentDialog] =
    useState(false);
  const [openRevertLocalAssessmentDialog, setOpenRevertLocalAssessmentDialog] =
    useState(false);
  const [pendingLocalAssessmentChoice, setPendingLocalAssessmentChoice] =
    useState<AssessmentDraft>();
  const [localAssessmentUpdatedAt, setLocalAssessmentUpdatedAt] =
    useState<Date>();
  const [pendingSaveFromDraft, setPendingSaveFromDraft] = useState(false);
  const [serverUpdatedAtState, setServerUpdatedAtState] = useState(
    assessmentTree.updatedAt,
  );

  const serverUpdatedAtRef = useRef(assessmentTree.updatedAt);
  const geometriesRef = useRef(geometries);
  const serializedFormValuesRef = useRef<SerializedFormValues>(
    formSubmission.responsesFormValues,
  );
  const responsesAreDirtyRef = useRef(false);
  const nonResponseItemsIsDirtyRef = useRef(false);
  const draftSaveTimeoutRef = useRef<number | undefined>(undefined);

  const scheduleDraftSave = useCallback(() => {
    if (!responsesAreDirtyRef.current && !nonResponseItemsIsDirtyRef.current) {
      return;
    }

    setPendingSaveFromDraft(true);
    window.clearTimeout(draftSaveTimeoutRef.current);
    draftSaveTimeoutRef.current = window.setTimeout(() => {
      const localAssessment: AssessmentDraft = {
        id: assessmentTree.id,
        userId: user.id,
        username: user.username,
        serverUpdatedAt: serverUpdatedAtRef.current,
        localUpdatedAt: new Date(),
        isFinalized,
        startDate: startDate.toDate(),
        endDate: endDate?.toDate() ?? null,
        driveFolderUrl,
        responseFormValues: serializedFormValuesRef.current,
        geometries: geometriesRef.current,
      };

      void saveAssessmentResponsesDraft(localAssessment);
      setLocalAssessmentUpdatedAt(localAssessment.localUpdatedAt);
    }, 500);
  }, [
    assessmentTree.id,
    driveFolderUrl,
    endDate,
    isFinalized,
    startDate,
    user.id,
    user.username,
  ]);

  const handleValuesChange = useCallback(
    ({
      serializedValues,
      changedQuestionId,
    }: ResponseFormValuesChange) => {
      serializedFormValuesRef.current = serializedValues;
      if (changedQuestionId !== undefined) {
        responsesAreDirtyRef.current = true;
        scheduleDraftSave();
      }
    },
    [scheduleDraftSave],
  );

  const handleGeometriesChange = useCallback(
    (nextGeometries: ResponseFormGeometry[]) => {
      geometriesRef.current = nextGeometries;
      setGeometries(nextGeometries);
      nonResponseItemsIsDirtyRef.current = true;
      scheduleDraftSave();
    },
    [scheduleDraftSave],
  );

  const applyLocalAssessmentValues = useCallback(
    (localAssessment: AssessmentDraft) => {
      responseFormRef.current?.reset(localAssessment.responseFormValues);
      serializedFormValuesRef.current = localAssessment.responseFormValues;
      setIsFinalized(localAssessment.isFinalized);
      setIsFilling(true);
      setStartDate(dayjs(localAssessment.startDate));
      setEndDate(
        localAssessment.endDate ? dayjs(localAssessment.endDate) : null,
      );
      setDriveFolderUrl(localAssessment.driveFolderUrl);
      setGeometries(localAssessment.geometries);
      geometriesRef.current = localAssessment.geometries;
      responsesAreDirtyRef.current = false;
      nonResponseItemsIsDirtyRef.current = false;
      setPendingLocalAssessmentChoice(undefined);
      setPendingSaveFromDraft(true);
    },
    [],
  );

  const applyServerAssessmentValues = useCallback(() => {
    const applyServerValuesAndDeleteLocalValues = async () => {
      setLoadingOverlay({ show: true, message: "Carregando..." });
      responseFormRef.current?.reset(formSubmission.responsesFormValues);
      serializedFormValuesRef.current = formSubmission.responsesFormValues;
      setIsFinalized(assessmentTree.isFinalized);
      setIsFilling(!assessmentTree.isFinalized);
      setStartDate(dayjs(assessmentTree.startDate));
      setEndDate(assessmentTree.endDate ? dayjs(assessmentTree.endDate) : null);
      setDriveFolderUrl(assessmentTree.driveFolderUrl);
      setGeometries(formSubmission.geometries);
      setResponseImages({});
      geometriesRef.current = formSubmission.geometries;
      responsesAreDirtyRef.current = false;
      nonResponseItemsIsDirtyRef.current = false;
      setPendingLocalAssessmentChoice(undefined);
      try {
        await deleteAssessmentResponsesDraft(assessmentTree.id);
        setPendingSaveFromDraft(false);
        setLocalAssessmentUpdatedAt(undefined);
      } catch {
        enqueueSnackbar("Erro ao remover dados locais!", {
          variant: "error",
        });
      } finally {
        if (assessmentTree.isFinalized) {
          setIsFilling(false);
        }
        setLoadingOverlay({ show: false });
      }
    };

    void applyServerValuesAndDeleteLocalValues();
  }, [
    assessmentTree,
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
      const importedImages: ResponseFormImages = Object.fromEntries(
        await Promise.all(
          Object.entries(importedData.responseImages).map(
            async ([questionId, images]) =>
              [
                questionId,
                await Promise.all(
                  images.map(async (image) => {
                    const imageEntry = image.path ? zip.file(image.path) : null;
                    if (image.path && !imageEntry) {
                      throw new Error(`Imagem ausente: ${image.path}`);
                    }
                    const imageBytes = await imageEntry?.async("arraybuffer");
                    return {
                      file:
                        imageBytes ?
                          new File([imageBytes], image.name, {
                            type: image.type,
                            lastModified: image.lastModified,
                          })
                        : undefined,
                      url: image.url,
                      status: image.status,
                    };
                  }),
                ),
              ] as const,
          ),
        ),
      );

      responseFormRef.current?.reset(importedData.responses);
      serializedFormValuesRef.current = importedData.responses;
      setGeometries(importedData.geometries);
      geometriesRef.current = importedData.geometries;
      setResponseImages(importedImages);
      setStartDate(dayjs(importedData.startDate));
      setEndDate(
        importedData.endDate && dayjs(importedData.endDate).isValid() ?
          dayjs(importedData.endDate)
        : null,
      );
      setIsFinalized(importedData.isFinalized);
      setDriveFolderUrl(importedData.driveFolderUrl);
      responsesAreDirtyRef.current = true;
      nonResponseItemsIsDirtyRef.current = true;
      scheduleDraftSave();
      enqueueSnackbar(<>Avaliação importada!</>, { variant: "success" });
    } catch {
      enqueueSnackbar(<>Arquivo inválido!</>, { variant: "error" });
    } finally {
      event.target.value = "";
    }
  };

  const handleQuestionImageSynced = (
    questionId: number,
    imageIndex: number,
  ) => {
    setResponseImages((current) => ({
      ...current,
      [questionId]: (current[questionId] ?? []).map((image, index) =>
        index === imageIndex ? { ...image, status: "SYNCED" } : image,
      ),
    }));
  };

  useEffect(() => {
    let ignore = false;

    const loadLocalAssessment = async () => {
      try {
        setLoadingOverlay({
          show: true,
          message: "Carregando respostas locais...",
        });
        const localAssessment = await loadAssessmentResponsesDraft(
          assessmentTree.id,
        );

        if (ignore || !localAssessment) return;

        setLocalAssessmentUpdatedAt(localAssessment.localUpdatedAt);
        if (
          assessmentTree.updatedAt.getTime() <=
          localAssessment.serverUpdatedAt.getTime()
        ) {
          applyLocalAssessmentValues(localAssessment);
          return;
        }

        setPendingLocalAssessmentChoice(localAssessment);
      } catch {
        enqueueSnackbar(<>Erro ao carregar respostas locais!</>, {
          variant: "error",
        });
      } finally {
        setLoadingOverlay({ show: false });
      }
    };

    void loadLocalAssessment();
    return () => {
      ignore = true;
    };
  }, [
    applyLocalAssessmentValues,
    assessmentTree.id,
    assessmentTree.updatedAt,
    enqueueSnackbar,
    setLoadingOverlay,
  ]);

  useEffect(() => () => window.clearTimeout(draftSaveTimeoutRef.current), []);

  const responseFormHeader = (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
      <div className="flex flex-wrap gap-1">
        <CChip
          label={formSubmission.formTree.name}
          icon={<IconClipboard />}
          sx={{ fontSize: 16 }}
          tooltip="Formulário"
        />
        <CChip
          label={assessmentTree.user.username}
          icon={<IconUser />}
          sx={{ fontSize: 16 }}
          tooltip="Avaliador"
        />
        {!isFilling && (
          <>
            <CChip
              icon={<IconClipboardData />}
              label={dateTimeFormatter.format(assessmentTree.startDate)}
              sx={{ fontSize: 16 }}
              tooltip="Início"
            />
            <CChip
              icon={<IconClipboardCheck />}
              label={
                assessmentTree.endDate ?
                  dateTimeFormatter.format(assessmentTree.endDate)
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
              nonResponseItemsIsDirtyRef.current = true;
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
          enableTopLeftChip={pendingSaveFromDraft}
          tooltip="Reverter alterações locais"
          square
          color={isFilling ? "warning" : undefined}
          disabled={!pendingSaveFromDraft}
          onClick={() => setOpenRevertLocalAssessmentDialog(true)}
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
          geometries={geometries}
          responseImages={responseImages}
          readOnly={!isFilling}
          locationPolygonGeoJson={locationPolygonGeoJson}
          onValuesChange={handleValuesChange}
          onGeometriesChange={handleGeometriesChange}
          onImagesChange={setResponseImages}
          onSubmit={() => {
            setOpenSaveDialog(true);
          }}
        />
      </div>

      {isFilling && (
        <CButton
          className="ml-auto mt-2 w-fit"
          enableTopLeftChip={pendingSaveFromDraft}
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
        assessmentId={assessmentTree.id}
        open={openSaveDialog}
        serializedFormValues={serializedFormValuesRef.current}
        geometries={geometries}
        endDate={endDate}
        isFinalized={isFinalized}
        startDate={startDate}
        driveFolderUrl={driveFolderUrl}
        responseImages={responseImages}
        categories={formSubmission.formTree.categories}
        locationId={locationId}
        formId={formSubmission.formTree.id}
        serverUpdatedAt={serverUpdatedAtRef.current}
        canSaveOffline={canSaveOffline}
        isSQLiteAssessment={isSQLiteAssessment}
        onResponseImageSynced={handleQuestionImageSynced}
        onSaveSuccess={(newUpdatedAt) => {
          serverUpdatedAtRef.current = newUpdatedAt;
          setServerUpdatedAtState(newUpdatedAt);
          setPendingSaveFromDraft(false);
          responsesAreDirtyRef.current = false;
          nonResponseItemsIsDirtyRef.current = false;
        }}
        onClose={() => setOpenSaveDialog(false)}
        onIsFinalizedChange={(value) => {
          nonResponseItemsIsDirtyRef.current = true;
          setIsFinalized(value);
        }}
        onEndDateChange={(value) => {
          nonResponseItemsIsDirtyRef.current = true;
          setEndDate(value);
        }}
        onIsSQLiteAssessmentChange={onIsSQLiteAssessmentChange}
      />
      <DeleteAssessmentDialog
        assessmentId={assessmentTree.id}
        open={openDeleteAssessmentDialog}
        isSQLiteAssessment={isSQLiteAssessment}
        onClose={() => setOpenDeleteAssessmentDialog(false)}
      />
      <RevertLocalAssessmentDialog
        open={openRevertLocalAssessmentDialog}
        localUpdatedAt={localAssessmentUpdatedAt}
        serverUpdatedAt={serverUpdatedAtState}
        onClose={() => setOpenRevertLocalAssessmentDialog(false)}
        onConfirm={() => {
          setOpenRevertLocalAssessmentDialog(false);
          applyServerAssessmentValues();
          enqueueSnackbar("Revertido com sucesso!", { variant: "success" });
        }}
      />
      <DriveFolderUrlDialog
        open={openDriveFolderUrlDialog}
        driveFolderUrl={driveFolderUrl}
        isFilling={isFilling}
        onClose={() => setOpenDriveFolderUrlDialog(false)}
        onConfirm={(url) => {
          nonResponseItemsIsDirtyRef.current = true;
          setDriveFolderUrl(url);
          scheduleDraftSave();
        }}
      />
      {!!pendingLocalAssessmentChoice && (
        <ChooseResponsesSourceDialog
          serverSource={{
            updatedAt: assessmentTree.updatedAt,
            username: assessmentTree.user.username,
          }}
          localSource={{
            updatedAt: pendingLocalAssessmentChoice.localUpdatedAt,
            username: pendingLocalAssessmentChoice.username,
          }}
          applyServerAssessmentValues={applyServerAssessmentValues}
          applyLocalAssessmentValues={() =>
            applyLocalAssessmentValues(pendingLocalAssessmentChoice)
          }
        />
      )}
    </div>
  );
};

export default AssessmentClient;
