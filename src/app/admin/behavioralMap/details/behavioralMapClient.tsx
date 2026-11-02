"use client";

import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import dayjs from "@/lib/dayjs";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { enqueueSnackbar } from "notistack";
import { useCallback, useMemo, useState } from "react";

import BehavioralMapEvaluationDialog from "./behavioralMapEvaluationDialog";
import BehavioralMapFormDialog from "./behavioralMapFormDialog";
import BehavioralMapMap from "./behavioralMapMap";
import BehavioralMapSaveDialog from "./behavioralMapSaveDialog";
import BehavioralMapFooter, { BehavioralMapFooterState } from "./footer";
import type {
  BehavioralMapObservation,
  BehavioralMapPendingPosition,
} from "./observationState";

type BehavioralMapDetails =
  FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  BehavioralMapDetails["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const BehavioralMapClient = ({
  behavioralMapDetails,
}: {
  behavioralMapDetails: BehavioralMapDetails;
}) => {
  const { behavioralMapSubmission } = behavioralMapDetails;
  const groups: ProtocolGroups =
    behavioralMapSubmission.behavioralMapProtocolStructure
      .behavioralMapProtocolGroups;
  const formSubmission = behavioralMapSubmission.formSubmission;
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [endDate, setEndDate] = useState(() =>
    behavioralMapDetails.endDate ? dayjs(behavioralMapDetails.endDate) : null,
  );
  const [isFinalized, setIsFinalized] = useState(
    behavioralMapDetails.isFinalized,
  );
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(() =>
    dayjs(behavioralMapDetails.startDate),
  );
  const [observations, setObservations] = useState<BehavioralMapObservation[]>(
    () =>
      behavioralMapSubmission.personObservations.flatMap((observation) => {
        if (!observation.position) return [];

        return [
          {
            localId: "saved-" + observation.id,
            position: [
              observation.position.longitude,
              observation.position.latitude,
            ] as [number, number],
            observedAt: observation.observedAt,
            quantity: observation.quantity,
            personCharacteristicIds: observation.characteristics.map(
              ({ personCharacteristicId }) => personCharacteristicId,
            ),
          },
        ];
      }),
  );

  const [pendingPosition, setPendingPosition] =
    useState<BehavioralMapPendingPosition | null>(null);
  const [footerState, setFooterState] = useState<BehavioralMapFooterState>(
    BehavioralMapFooterState.IDLE,
  );
  const [selectedObservationLocalId, setSelectedObservationLocalId] = useState<
    string | null
  >(null);
  const [serializedFormValues, setSerializedFormValues] =
    useState<SerializedFormValues>(
      () => formSubmission?.responsesFormValues ?? {},
    );
  const [geometries, setGeometries] = useState<ResponseFormGeometry[]>(
    () => formSubmission?.geometries ?? [],
  );
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const handleMapClick = useCallback(
    (position: [number, number]) => {
      if (
        footerState === BehavioralMapFooterState.ADDING_OBSERVATION ||
        pendingPosition
      ) {
        return;
      }

      setSelectedObservationLocalId(null);
      setPendingPosition({
        position,
        observedAt: new Date(),
      });
      setFooterState(BehavioralMapFooterState.ADDING_OBSERVATION);
    },
    [footerState, pendingPosition],
  );

  const handleCancelObservation = useCallback(() => {
    setPendingPosition(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleSubmitObservation = useCallback(
    (personCharacteristicIds: number[], quantity: number) => {
      if (!pendingPosition || quantity < 1) return;

      const observation: BehavioralMapObservation = {
        localId: "local-" + crypto.randomUUID(),
        position: pendingPosition.position,
        observedAt: pendingPosition.observedAt,
        quantity,
        personCharacteristicIds,
      };

      setObservations((current) => [...current, observation]);
      setPendingPosition(null);
      setFooterState(BehavioralMapFooterState.IDLE);

      const selectedCharacteristics = groups.flatMap((group) =>
        group.characteristics.filter(({ personCharacteristic }) =>
          personCharacteristicIds.includes(personCharacteristic.id),
        ),
      );

      enqueueSnackbar({
        anchorOrigin: { vertical: "top", horizontal: "center" },
        autoHideDuration: 3000,
        variant: "node",
        preventDuplicate: false,
        backgroundColor: "#43a047",
        node: (
          <div className="flex max-w-[90vw] flex-col gap-1 text-white">
            <span className="font-semibold">
              + {quantity} {quantity === 1 ? "pessoa" : "pessoas"}
            </span>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {selectedCharacteristics.map(({ personCharacteristic }) => (
                <span
                  key={personCharacteristic.id}
                  className="flex items-center gap-1"
                >
                  <CDynamicIcon iconKey={personCharacteristic.iconKey} />
                  {personCharacteristic.name}
                </span>
              ))}
            </div>
          </div>
        ),
      });
    },
    [groups, pendingPosition],
  );

  const handleObservationClick = useCallback(
    (localId: string) => {
      if (footerState === BehavioralMapFooterState.ADDING_OBSERVATION) return;
      setSelectedObservationLocalId(localId);
      setFooterState(BehavioralMapFooterState.OBSERVATION_SELECTED);
    },
    [footerState],
  );

  const handleCloseSelectedObservation = useCallback(() => {
    setSelectedObservationLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const selectedObservation = useMemo(
    () =>
      observations.find(
        ({ localId }) => localId === selectedObservationLocalId,
      ) ?? null,
    [observations, selectedObservationLocalId],
  );

  const handleOpenEvaluation = useCallback(
    () => setIsEvaluationDialogOpen(true),
    [],
  );

  const handleOpenSave = useCallback(() => {
    setIsSaveDialogOpen(true);
  }, []);

  const handleOpenForm = useCallback(() => {
    if (formSubmission) setIsFormDialogOpen(true);
  }, [formSubmission]);

  const handleFormDialogClose = useCallback(
    (
      updatedSerializedFormValues: SerializedFormValues,
      updatedGeometries: ResponseFormGeometry[],
    ) => {
      setSerializedFormValues(updatedSerializedFormValues);
      setGeometries(updatedGeometries);
      setIsFormDialogOpen(false);
    },
    [],
  );
  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-black">
      <BehavioralMapMap
        details={behavioralMapDetails}
        groups={groups}
        observations={observations}
        pendingPosition={pendingPosition}
        selectedObservationLocalId={selectedObservationLocalId}
        onMapClick={handleMapClick}
        onObservationClick={handleObservationClick}
      />

      <BehavioralMapFooter
        state={footerState}
        groups={groups}
        observedAt={pendingPosition?.observedAt ?? new Date()}
        selectedObservation={selectedObservation}
        onCancel={handleCancelObservation}
        onSubmitObservation={handleSubmitObservation}
        onCloseSelectedObservation={handleCloseSelectedObservation}
        onOpenForm={formSubmission ? handleOpenForm : undefined}
        onOpenEvaluation={handleOpenEvaluation}
        onOpenSave={handleOpenSave}
      />
      <BehavioralMapEvaluationDialog
        open={isEvaluationDialogOpen}
        protocolName={
          behavioralMapSubmission.behavioralMapProtocolStructure.name
        }
        username={behavioralMapDetails.user.username}
        startDate={startDate}
        onStartDateChange={setStartDate}
        onClose={() => setIsEvaluationDialogOpen(false)}
      />

      {formSubmission && (
        <BehavioralMapFormDialog
          open={isFormDialogOpen}
          formSubmission={formSubmission}
          locationPolygonGeoJson={behavioralMapDetails.location.st_asgeojson}
          serializedFormValues={serializedFormValues}
          geometries={geometries}
          onClose={handleFormDialogClose}
        />
      )}
      <BehavioralMapSaveDialog
        open={isSaveDialogOpen}
        behavioralMapId={behavioralMapDetails.id}
        formSubmission={
          formSubmission ?
            { responses: serializedFormValues, geometries }
          : undefined
        }
        observations={observations.map(
          ({ localId: _localId, ...observation }) => observation,
        )}
        startDate={startDate}
        endDate={endDate}
        isFinalized={isFinalized}
        onSaveSuccess={(data) => setIsFinalized(data.savedAsFinalized)}
        onEndDateChange={setEndDate}
        onIsFinalizedChange={setIsFinalized}
        onClose={() => setIsSaveDialogOpen(false)}
      />
    </div>
  );
};

export default BehavioralMapClient;
