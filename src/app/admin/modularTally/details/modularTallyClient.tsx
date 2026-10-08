"use client";

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
import type { FormSubmissionData } from "@/lib/serverFunctions/mutations/formSubmission";
import type { FetchModularTallyDetailsResponse } from "@/lib/serverFunctions/queries/modularTally";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import {
  IconArrowBackUp,
  IconChartBar,
  IconClipboard,
  IconClipboardCheck,
  IconClipboardData,
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GrGroup } from "react-icons/gr";

import ChooseModularTallySourceDialog from "./chooseModularTallySourceDialog";
import DeleteModularTallyDialog from "./deleteModularTallyDialog";
import {
  type ModularTallyDraft,
  deleteModularTallyDraft,
  fetchModularTallyDraft,
  saveModularTallyDraft,
} from "./modularTallyDraft";
import {
  changePersonObservationQuantity,
  createPersonObservationState,
  serializePersonObservationState,
} from "./personObservationState";
import PersonsCounter from "./personsCounter";
import RevertModularTallyDraftDialog from "./revertModularTallyDraftDialog";
import SaveModularTallyDialog from "./saveModularTallyDialog";
import TallyPersonsDialog from "./tallyPersonsDialog";

type ModularTallyDetails =
  FetchModularTallyDetailsResponse["modularTallyDetails"];

const ModularTallyClient = ({
  modularTallyDetails,
}: {
  modularTallyDetails: ModularTallyDetails;
}) => {
  const responseFormRef = useRef<ResponseFormV2Handle>(null);
  const { user } = useUserContext();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { modularTallySubmission } = modularTallyDetails;
  const formSubmission = modularTallySubmission.formSubmission;
  const serializedFormValuesRef = useRef<SerializedFormValues | undefined>(
    formSubmission?.responsesFormValues,
  );
  const geometriesRef = useRef<ResponseFormGeometry[] | undefined>(
    formSubmission?.geometries,
  );
  const userCanEdit =
    modularTallyDetails.user.id === user.id ||
    user.roles.includes("TALLY_MANAGER");
  const [isFilling, setIsFilling] = useState(
    modularTallyDetails.isFinalized ? false : userCanEdit,
  );
  const [startDate, setStartDate] = useState(() =>
    dayjs(modularTallyDetails.startDate),
  );
  const [endDate, setEndDate] = useState(
    modularTallyDetails.endDate ? dayjs(modularTallyDetails.endDate) : null,
  );
  const [isFinalized, setIsFinalized] = useState(
    modularTallyDetails.isFinalized,
  );
  const [pendingSave, setPendingSave] = useState(false);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<Date>();
  const [savedUpdatedAtState, setSavedUpdatedAtState] = useState(
    modularTallyDetails.updatedAt,
  );
  const [pendingDraftModularTallyChoice, setPendingDraftModularTallyChoice] =
    useState<ModularTallyDraft>();
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openStatisticsDialog, setOpenStatisticsDialog] = useState(false);
  const [openDeleteModularTallyDialog, setOpenDeleteModularTallyDialog] =
    useState(false);
  const [
    openRevertModularTallyDraftDialog,
    setOpenRevertModularTallyDraftDialog,
  ] = useState(false);
  const [personObservations, setPersonObservations] = useState(() =>
    createPersonObservationState(modularTallySubmission.personObservations),
  );
  const isDirtyRef = useRef(false);
  const savedUpdatedAtRef = useRef(modularTallyDetails.updatedAt);
  const draftSaveTimeoutRef = useRef<number | undefined>(undefined);
  const initialPersonObservationsRef = useRef(personObservations);
  const serializedPersonObservations = useMemo(
    () => serializePersonObservationState(personObservations),
    [personObservations],
  );
  const readOnly = !isFilling;
  const scheduleDraftSave = useCallback(() => {
    if (!isDirtyRef.current) return;

    setPendingSave(true);
    window.clearTimeout(draftSaveTimeoutRef.current);
    draftSaveTimeoutRef.current = window.setTimeout(() => {
      const modularTallyDraft: ModularTallyDraft = {
        id: modularTallyDetails.id,
        userId: user.id,
        username: user.username,
        savedUpdatedAt: savedUpdatedAtRef.current,
        draftUpdatedAt: new Date(),
        isFinalized,
        startDate: startDate.toDate(),
        endDate: endDate?.toDate() ?? null,
        responseFormValues: serializedFormValuesRef.current,
        geometries: geometriesRef.current,
        personObservations: serializedPersonObservations,
      };

      void saveModularTallyDraft(modularTallyDraft);
      setDraftUpdatedAt(modularTallyDraft.draftUpdatedAt);
    }, 500);
  }, [
    endDate,
    isFinalized,
    modularTallyDetails.id,
    serializedPersonObservations,
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

  const applyDraftModularTallyValues = useCallback(
    (modularTallyDraft: ModularTallyDraft) => {
      window.clearTimeout(draftSaveTimeoutRef.current);
      if (
        formSubmission &&
        modularTallyDraft.responseFormValues &&
        modularTallyDraft.geometries
      ) {
        responseFormRef.current?.reset({
          responsesFormValues: modularTallyDraft.responseFormValues,
          geometries: modularTallyDraft.geometries,
        });
      }
      serializedFormValuesRef.current = modularTallyDraft.responseFormValues;
      geometriesRef.current = modularTallyDraft.geometries;
      const draftPersonObservations = createPersonObservationState(
        modularTallyDraft.personObservations,
      );
      initialPersonObservationsRef.current = draftPersonObservations;
      setPersonObservations(draftPersonObservations);
      setIsFinalized(modularTallyDraft.isFinalized);
      setIsFilling(true);
      setStartDate(dayjs(modularTallyDraft.startDate));
      setEndDate(
        modularTallyDraft.endDate ? dayjs(modularTallyDraft.endDate) : null,
      );
      setDraftUpdatedAt(modularTallyDraft.draftUpdatedAt);
      isDirtyRef.current = false;
      setPendingDraftModularTallyChoice(undefined);
      setPendingSave(true);
    },
    [formSubmission],
  );

  const applySavedModularTallyValues = useCallback(() => {
    const applySavedValuesAndDeleteDraft = async () => {
      window.clearTimeout(draftSaveTimeoutRef.current);
      setLoadingOverlay({ show: true, message: "Carregando..." });
      if (formSubmission) {
        responseFormRef.current?.reset({
          responsesFormValues: formSubmission.responsesFormValues,
          geometries: formSubmission.geometries,
        });
      }
      serializedFormValuesRef.current = formSubmission?.responsesFormValues;
      geometriesRef.current = formSubmission?.geometries;
      const savedPersonObservations = createPersonObservationState(
        modularTallySubmission.personObservations,
      );
      initialPersonObservationsRef.current = savedPersonObservations;
      setPersonObservations(savedPersonObservations);
      setIsFinalized(modularTallyDetails.isFinalized);
      setIsFilling(!modularTallyDetails.isFinalized);
      setStartDate(dayjs(modularTallyDetails.startDate));
      setEndDate(
        modularTallyDetails.endDate ? dayjs(modularTallyDetails.endDate) : null,
      );
      isDirtyRef.current = false;
      setPendingDraftModularTallyChoice(undefined);

      try {
        await deleteModularTallyDraft(modularTallyDetails.id);
        setPendingSave(false);
        setDraftUpdatedAt(undefined);
      } catch {
        enqueueSnackbar("Erro ao remover dados locais!", {
          variant: "error",
        });
      } finally {
        if (modularTallyDetails.isFinalized) {
          setIsFilling(false);
        }
        setLoadingOverlay({ show: false });
      }
    };

    void applySavedValuesAndDeleteDraft();
  }, [
    formSubmission,
    modularTallyDetails,
    modularTallySubmission.personObservations,
    setLoadingOverlay,
  ]);

  useEffect(() => {
    if (initialPersonObservationsRef.current === personObservations) return; // avoid schedule save on initial render

    initialPersonObservationsRef.current = personObservations;
    isDirtyRef.current = true;
    scheduleDraftSave();
  }, [personObservations, scheduleDraftSave]);

  useEffect(() => {
    let ignore = false;

    const loadModularTallyDraft = async () => {
      try {
        setLoadingOverlay({
          show: true,
          message: "Carregando dados locais...",
        });
        const modularTallyDraft = await fetchModularTallyDraft(
          modularTallyDetails.id,
        );

        if (ignore || !modularTallyDraft) return;

        setDraftUpdatedAt(modularTallyDraft.draftUpdatedAt);
        if (
          modularTallyDetails.updatedAt.getTime() <=
          modularTallyDraft.savedUpdatedAt.getTime()
        ) {
          applyDraftModularTallyValues(modularTallyDraft);
          return;
        }

        setPendingDraftModularTallyChoice(modularTallyDraft);
      } catch {
        enqueueSnackbar("Erro ao carregar dados locais!", {
          variant: "error",
        });
      } finally {
        setLoadingOverlay({ show: false });
      }
    };

    void loadModularTallyDraft();
    return () => {
      ignore = true;
    };
  }, [
    applyDraftModularTallyValues,
    modularTallyDetails.id,
    modularTallyDetails.updatedAt,
    setLoadingOverlay,
  ]);

  useEffect(() => () => window.clearTimeout(draftSaveTimeoutRef.current), []);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
      <div className="flex flex-wrap gap-1">
        {formSubmission && (
          <CChip
            label={formSubmission.formStructure.formName}
            icon={<IconClipboard />}
            sx={{ fontSize: 16 }}
            tooltip="Formulário"
          />
        )}
        <CChip
          label={modularTallyDetails.user.username}
          icon={<IconUser />}
          sx={{ fontSize: 16 }}
          tooltip="Responsável"
        />
        {!isFilling && (
          <>
            <CChip
              icon={<IconClipboardData />}
              label={dateTimeFormatter.format(modularTallyDetails.startDate)}
              sx={{ fontSize: 16 }}
              tooltip="Início"
            />
            <CChip
              icon={<IconClipboardCheck />}
              label={
                modularTallyDetails.endDate ?
                  dateTimeFormatter.format(modularTallyDetails.endDate)
                : "Indefinido"
              }
              sx={{ fontSize: 16 }}
              tooltip="Fim"
            />
          </>
        )}
      </div>

      <div className="flex min-w-fit flex-1 flex-wrap items-center gap-2">
        {isFilling && (
          <CDateTimePicker
            label="Início"
            value={startDate}
            onChange={(value) => {
              if (!value) return;
              setStartDate(value);
              isDirtyRef.current = true;
              scheduleDraftSave();
            }}
          />
        )}
        <div className="ml-auto flex items-center gap-2">
          {!isFilling && userCanEdit && (
            <>
              <CHelpChip tooltip="Você possui permissão para editar esta contagem finalizada." />
              <CButton
                square
                tooltip="Editar contagem"
                onClick={() => setIsFilling(true)}
              >
                <IconPencil />
              </CButton>
            </>
          )}
          <CButton
            topLeftChipLabel="!"
            enableTopLeftChip={pendingSave}
            tooltip="Reverter alterações locais"
            square
            color={isFilling ? "warning" : undefined}
            disabled={!pendingSave}
            onClick={() => setOpenRevertModularTallyDraftDialog(true)}
          >
            <IconArrowBackUp />
          </CButton>
          {isFilling && (
            <CButton
              square
              tooltip="Excluir contagem"
              color="error"
              onClick={() => setOpenDeleteModularTallyDialog(true)}
            >
              <IconTrash />
            </CButton>
          )}
        </div>
      </div>
    </div>
  );

  const personsCounter = (
    <PersonsCounter
      modularTallyTemplateStructure={
        modularTallySubmission.modularTallyTemplateStructure
      }
      personObservations={personObservations}
      readOnly={readOnly}
      onQuantityChange={(personCharacteristicIds, delta) => {
        setPersonObservations((current) =>
          changePersonObservationQuantity({
            state: current,
            personCharacteristicIds,
            delta,
          }),
        );
      }}
    />
  );

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader
        title={`Contagem em ${modularTallyDetails.location.name}`}
        titleIcon={<GrGroup size={28} />}
      />

      <div className="min-h-0 flex-1">
        {formSubmission ?
          <ResponseFormV2
            ref={responseFormRef}
            header={header}
            formSubmission={formSubmission}
            readOnly={readOnly}
            footer={personsCounter}
            disableFilledQuestionsCounter
            locationPolygonGeoJson={modularTallyDetails.location.st_asgeojson}
            onValuesChange={handleValuesChange}
            onGeometriesChange={handleGeometriesChange}
            onSubmit={() => setOpenSaveDialog(true)}
          />
        : <div className="h-full overflow-auto">
            {header}
            {personsCounter}
          </div>
        }
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <CButton onClick={() => setOpenStatisticsDialog(true)}>
          <IconChartBar />
          Estatísticas
        </CButton>

        <CButton
          enableTopLeftChip={pendingSave}
          topLeftChipLabel="!"
          disabled={!isFilling}
          onClick={() => {
            if (formSubmission) {
              responseFormRef.current?.submit();
            } else {
              setOpenSaveDialog(true);
            }
          }}
        >
          <IconDeviceFloppy />
          Salvar
        </CButton>
      </div>

      <SaveModularTallyDialog
        open={openSaveDialog}
        modularTallyId={modularTallyDetails.id}
        formSubmission={
          formSubmission ?
            ({
              responses: serializedFormValuesRef.current ?? {},
              geometries: geometriesRef.current ?? [],
            } satisfies FormSubmissionData)
          : undefined
        }
        personObservations={serializedPersonObservations}
        startDate={startDate}
        endDate={endDate}
        isFinalized={isFinalized}
        onClose={() => setOpenSaveDialog(false)}
        onSaveSuccess={(data) => {
          window.clearTimeout(draftSaveTimeoutRef.current);
          savedUpdatedAtRef.current = data.updatedAt;
          setSavedUpdatedAtState(data.updatedAt);
          setPendingSave(false);
          setDraftUpdatedAt(undefined);
          isDirtyRef.current = false;
        }}
        onEndDateChange={(value) => {
          setEndDate(value);
          isDirtyRef.current = true;
          scheduleDraftSave();
        }}
        onIsFinalizedChange={(value) => {
          setIsFinalized(value);
          isDirtyRef.current = true;
          scheduleDraftSave();
        }}
      />

      <DeleteModularTallyDialog
        modularTallyId={modularTallyDetails.id}
        open={openDeleteModularTallyDialog}
        onClose={() => setOpenDeleteModularTallyDialog(false)}
      />

      <RevertModularTallyDraftDialog
        open={openRevertModularTallyDraftDialog}
        draftUpdatedAt={draftUpdatedAt}
        savedUpdatedAt={savedUpdatedAtState}
        onClose={() => setOpenRevertModularTallyDraftDialog(false)}
        onConfirm={() => {
          setOpenRevertModularTallyDraftDialog(false);
          applySavedModularTallyValues();
          enqueueSnackbar("Revertido com sucesso!", { variant: "success" });
        }}
      />

      <TallyPersonsDialog
        open={openStatisticsDialog}
        modularTallyTemplateStructure={
          modularTallySubmission.modularTallyTemplateStructure
        }
        personObservations={serializedPersonObservations}
        onClose={() => setOpenStatisticsDialog(false)}
      />

      {!!pendingDraftModularTallyChoice && (
        <ChooseModularTallySourceDialog
          savedSource={{
            updatedAt: modularTallyDetails.updatedAt,
            username: modularTallyDetails.user.username,
          }}
          draftSource={{
            updatedAt: pendingDraftModularTallyChoice.draftUpdatedAt,
            username: pendingDraftModularTallyChoice.username,
          }}
          applySavedModularTallyValues={applySavedModularTallyValues}
          applyDraftModularTallyValues={() =>
            applyDraftModularTallyValues(pendingDraftModularTallyChoice)
          }
        />
      )}
    </div>
  );
};

export default ModularTallyClient;
