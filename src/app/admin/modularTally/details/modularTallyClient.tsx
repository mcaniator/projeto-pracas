"use client";

import { useUserContext } from "@/components/context/UserContext";
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
  IconChartBar,
  IconClipboard,
  IconClipboardCheck,
  IconClipboardData,
  IconDeviceFloppy,
  IconPencil,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GrGroup } from "react-icons/gr";

import DeleteModularTallyDialog from "./deleteModularTallyDialog";
import {
  changePersonObservationQuantity,
  createPersonObservationState,
  serializePersonObservationState,
} from "./personObservationState";
import PersonsCounter from "./personsCounter";
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
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openStatisticsDialog, setOpenStatisticsDialog] = useState(false);
  const [openDeleteModularTallyDialog, setOpenDeleteModularTallyDialog] =
    useState(false);
  const [personObservations, setPersonObservations] = useState(() =>
    createPersonObservationState(modularTallySubmission.personObservations),
  );
  const isDirtyRef = useRef(false);
  const initialPersonObservationsRef = useRef(personObservations);
  const serializedPersonObservations = useMemo(
    () => serializePersonObservationState(personObservations),
    [personObservations],
  );
  const readOnly = !isFilling;
  const scheduleDraftSave = useCallback(() => {
    if (!isDirtyRef.current) return;

    setPendingSave(true);
    // TODO: Implementar o salvamento local do draft da contagem.
  }, []);
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

  useEffect(() => {
    if (initialPersonObservationsRef.current === personObservations) return; // avoid schedule save on initial render

    initialPersonObservationsRef.current = personObservations;
    isDirtyRef.current = true;
    scheduleDraftSave();
  }, [personObservations, scheduleDraftSave]);

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

      <div className="flex flex-wrap items-center gap-2">
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
        onSaveSuccess={() => {
          setPendingSave(false);
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

      <TallyPersonsDialog
        open={openStatisticsDialog}
        modularTallyTemplateStructure={
          modularTallySubmission.modularTallyTemplateStructure
        }
        personObservations={serializedPersonObservations}
        onClose={() => setOpenStatisticsDialog(false)}
      />
    </div>
  );
};

export default ModularTallyClient;
