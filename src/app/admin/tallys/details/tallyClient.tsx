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
import type { FetchTallyDetailsResponse } from "@/lib/serverFunctions/queries/tally";
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

import ChooseTallySourceDialog from "./chooseTallySourceDialog";
import DeleteTallyDialog from "./deleteTallyDialog";
import {
  type TallyDraft,
  deleteTallyDraft,
  fetchTallyDraft,
  saveTallyDraft,
} from "./tallyDraft";
import {
  changePersonObservationQuantity,
  createPersonObservationState,
  serializePersonObservationState,
} from "./personObservationState";
import PersonsCounter from "./personsCounter";
import RevertTallyDraftDialog from "./revertTallyDraftDialog";
import SaveTallyDialog from "./saveTallyDialog";
import TallyPersonsDialog from "./tallyPersonsDialog";

type TallyDetails =
  FetchTallyDetailsResponse["tallyDetails"];

const TallyClient = ({
  tallyDetails,
}: {
  tallyDetails: TallyDetails;
}) => {
  const responseFormRef = useRef<ResponseFormV2Handle>(null);
  const { user } = useUserContext();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { tallySubmission } = tallyDetails;
  const formSubmission = tallySubmission.formSubmission;
  const serializedFormValuesRef = useRef<SerializedFormValues | undefined>(
    formSubmission?.responsesFormValues,
  );
  const geometriesRef = useRef<ResponseFormGeometry[] | undefined>(
    formSubmission?.geometries,
  );
  const userCanEdit =
    tallyDetails.user.id === user.id ||
    user.roles.includes("TALLY_MANAGER");
  const [isFilling, setIsFilling] = useState(
    tallyDetails.isFinalized ? false : userCanEdit,
  );
  const [startDate, setStartDate] = useState(() =>
    dayjs(tallyDetails.startDate),
  );
  const [endDate, setEndDate] = useState(
    tallyDetails.endDate ? dayjs(tallyDetails.endDate) : null,
  );
  const [isFinalized, setIsFinalized] = useState(
    tallyDetails.isFinalized,
  );
  const [pendingSave, setPendingSave] = useState(false);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<Date>();
  const [savedUpdatedAtState, setSavedUpdatedAtState] = useState(
    tallyDetails.updatedAt,
  );
  const [pendingDraftTallyChoice, setPendingDraftTallyChoice] =
    useState<TallyDraft>();
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openStatisticsDialog, setOpenStatisticsDialog] = useState(false);
  const [openDeleteTallyDialog, setOpenDeleteTallyDialog] =
    useState(false);
  const [
    openRevertTallyDraftDialog,
    setOpenRevertTallyDraftDialog,
  ] = useState(false);
  const [personObservations, setPersonObservations] = useState(() =>
    createPersonObservationState(tallySubmission.personObservations),
  );
  const isDirtyRef = useRef(false);
  const savedUpdatedAtRef = useRef(tallyDetails.updatedAt);
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
      const tallyDraft: TallyDraft = {
        id: tallyDetails.id,
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

      void saveTallyDraft(tallyDraft);
      setDraftUpdatedAt(tallyDraft.draftUpdatedAt);
    }, 500);
  }, [
    endDate,
    isFinalized,
    tallyDetails.id,
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

  const applyDraftTallyValues = useCallback(
    (tallyDraft: TallyDraft) => {
      window.clearTimeout(draftSaveTimeoutRef.current);
      if (
        formSubmission &&
        tallyDraft.responseFormValues &&
        tallyDraft.geometries
      ) {
        responseFormRef.current?.reset({
          responsesFormValues: tallyDraft.responseFormValues,
          geometries: tallyDraft.geometries,
        });
      }
      serializedFormValuesRef.current = tallyDraft.responseFormValues;
      geometriesRef.current = tallyDraft.geometries;
      const draftPersonObservations = createPersonObservationState(
        tallyDraft.personObservations,
      );
      initialPersonObservationsRef.current = draftPersonObservations;
      setPersonObservations(draftPersonObservations);
      setIsFinalized(tallyDraft.isFinalized);
      setIsFilling(true);
      setStartDate(dayjs(tallyDraft.startDate));
      setEndDate(
        tallyDraft.endDate ? dayjs(tallyDraft.endDate) : null,
      );
      setDraftUpdatedAt(tallyDraft.draftUpdatedAt);
      isDirtyRef.current = false;
      setPendingDraftTallyChoice(undefined);
      setPendingSave(true);
    },
    [formSubmission],
  );

  const applySavedTallyValues = useCallback(() => {
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
        tallySubmission.personObservations,
      );
      initialPersonObservationsRef.current = savedPersonObservations;
      setPersonObservations(savedPersonObservations);
      setIsFinalized(tallyDetails.isFinalized);
      setIsFilling(!tallyDetails.isFinalized);
      setStartDate(dayjs(tallyDetails.startDate));
      setEndDate(
        tallyDetails.endDate ? dayjs(tallyDetails.endDate) : null,
      );
      isDirtyRef.current = false;
      setPendingDraftTallyChoice(undefined);

      try {
        await deleteTallyDraft(tallyDetails.id);
        setPendingSave(false);
        setDraftUpdatedAt(undefined);
      } catch (e) {
        enqueueSnackbar("Erro ao remover dados locais!", {
          variant: "error",
        });
      } finally {
        if (tallyDetails.isFinalized) {
          setIsFilling(false);
        }
        setLoadingOverlay({ show: false });
      }
    };

    void applySavedValuesAndDeleteDraft();
  }, [
    formSubmission,
    tallyDetails,
    tallySubmission.personObservations,
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

    const loadTallyDraft = async () => {
      try {
        setLoadingOverlay({
          show: true,
          message: "Carregando dados locais...",
        });
        const tallyDraft = await fetchTallyDraft(
          tallyDetails.id,
        );

        if (ignore || !tallyDraft) return;

        setDraftUpdatedAt(tallyDraft.draftUpdatedAt);
        if (
          tallyDetails.updatedAt.getTime() <=
          tallyDraft.savedUpdatedAt.getTime()
        ) {
          applyDraftTallyValues(tallyDraft);
          return;
        }

        setPendingDraftTallyChoice(tallyDraft);
      } catch {
        enqueueSnackbar("Erro ao carregar dados locais!", {
          variant: "error",
        });
      } finally {
        setLoadingOverlay({ show: false });
      }
    };

    void loadTallyDraft();
    return () => {
      ignore = true;
    };
  }, [
    applyDraftTallyValues,
    tallyDetails.id,
    tallyDetails.updatedAt,
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
          label={tallyDetails.user.username}
          icon={<IconUser />}
          sx={{ fontSize: 16 }}
          tooltip="Responsável"
        />
        {!isFilling && (
          <>
            <CChip
              icon={<IconClipboardData />}
              label={dateTimeFormatter.format(tallyDetails.startDate)}
              sx={{ fontSize: 16 }}
              tooltip="Início"
            />
            <CChip
              icon={<IconClipboardCheck />}
              label={
                tallyDetails.endDate ?
                  dateTimeFormatter.format(tallyDetails.endDate)
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
            onClick={() => setOpenRevertTallyDraftDialog(true)}
          >
            <IconArrowBackUp />
          </CButton>
          {isFilling && (
            <CButton
              square
              tooltip="Excluir contagem"
              color="error"
              onClick={() => setOpenDeleteTallyDialog(true)}
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
      tallyProtocolStructure={
        tallySubmission.tallyProtocolStructure
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
        title={`Contagem em ${tallyDetails.location.name}`}
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
            locationPolygonGeoJson={tallyDetails.location.st_asgeojson}
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

      <SaveTallyDialog
        open={openSaveDialog}
        tallyId={tallyDetails.id}
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

      <DeleteTallyDialog
        tallyId={tallyDetails.id}
        open={openDeleteTallyDialog}
        onClose={() => setOpenDeleteTallyDialog(false)}
      />

      <RevertTallyDraftDialog
        open={openRevertTallyDraftDialog}
        draftUpdatedAt={draftUpdatedAt}
        savedUpdatedAt={savedUpdatedAtState}
        onClose={() => setOpenRevertTallyDraftDialog(false)}
        onConfirm={() => {
          setOpenRevertTallyDraftDialog(false);
          applySavedTallyValues();
          enqueueSnackbar("Revertido com sucesso!", { variant: "success" });
        }}
      />

      <TallyPersonsDialog
        open={openStatisticsDialog}
        tallyProtocolStructure={
          tallySubmission.tallyProtocolStructure
        }
        personObservations={serializedPersonObservations}
        onClose={() => setOpenStatisticsDialog(false)}
      />

      {!!pendingDraftTallyChoice && (
        <ChooseTallySourceDialog
          savedSource={{
            updatedAt: tallyDetails.updatedAt,
            username: tallyDetails.user.username,
          }}
          draftSource={{
            updatedAt: pendingDraftTallyChoice.draftUpdatedAt,
            username: pendingDraftTallyChoice.username,
          }}
          applySavedTallyValues={applySavedTallyValues}
          applyDraftTallyValues={() =>
            applyDraftTallyValues(pendingDraftTallyChoice)
          }
        />
      )}
    </div>
  );
};

export default TallyClient;
