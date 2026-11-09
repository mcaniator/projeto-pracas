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
  BehavioralMapGroup,
  BehavioralMapInteraction,
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
  const [behavioralMapGroups, setBehavioralMapGroups] = useState<
    BehavioralMapGroup[]
  >(() =>
    behavioralMapSubmission.groups.map((group, index) => ({
      localId: `saved-group-${group.id}`,
      label: group.label ?? `Grupo ${index + 1}`,
    })),
  );
  const [observations, setObservations] = useState<BehavioralMapObservation[]>(
    () =>
      behavioralMapSubmission.personObservations.flatMap((observation) => {
        if (!observation.position) return [];

        return [
          {
            localId: "saved-" + observation.id,
            groupLocalIds: observation.groupMemberships.map(
              ({ behavioralMapGroupId }) =>
                `saved-group-${behavioralMapGroupId}`,
            ),
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

  const [interactions, setInteractions] = useState<BehavioralMapInteraction[]>(
    () =>
      behavioralMapSubmission.personObservations.flatMap((observation) =>
        observation.interactionsAsObservationA.map((interaction) => ({
          localId: `saved-interaction-${interaction.id}`,
          observationALocalId: `saved-${observation.id}`,
          observationBLocalId: `saved-${interaction.observationBId}`,
          description: interaction.description,
        })),
      ),
  );
  const [groupLabel, setGroupLabel] = useState("");
  const [selectedGroupTargetLocalIds, setSelectedGroupTargetLocalIds] =
    useState<string[]>([]);
  const [interactionDescription, setInteractionDescription] = useState("");
  const [
    selectedInteractionSourceLocalId,
    setSelectedInteractionSourceLocalId,
  ] = useState<string | null>(null);
  const [
    selectedInteractionTargetLocalIds,
    setSelectedInteractionTargetLocalIds,
  ] = useState<string[]>([]);
  const [isSelfInteractionSelected, setIsSelfInteractionSelected] =
    useState(false);

  const [pendingPosition, setPendingPosition] =
    useState<BehavioralMapPendingPosition | null>(null);
  const [footerState, setFooterState] = useState<BehavioralMapFooterState>(
    BehavioralMapFooterState.IDLE,
  );
  const [selectedInteractionLocalId, setSelectedInteractionLocalId] = useState<
    string | null
  >(null);
  const [selectedGroupLocalId, setSelectedGroupLocalId] = useState<
    string | null
  >(null);
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
        footerState === BehavioralMapFooterState.ADDING_INTERACTION ||
        footerState === BehavioralMapFooterState.ADDING_GROUP ||
        footerState === BehavioralMapFooterState.EDITING_INTERACTION ||
        footerState === BehavioralMapFooterState.EDITING_GROUP ||
        pendingPosition
      ) {
        return;
      }

      setSelectedObservationLocalId(null);
      setSelectedInteractionLocalId(null);
      setSelectedGroupLocalId(null);
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
        groupLocalIds: [],
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
      if (footerState === BehavioralMapFooterState.ADDING_GROUP) {
        const target = observations.find(
          (observation) => observation.localId === localId,
        );
        if (!target) return;
        setSelectedGroupTargetLocalIds((current) =>
          current.includes(localId) ?
            current.filter((id) => id !== localId)
          : [...current, localId],
        );
        return;
      }
      if (footerState === BehavioralMapFooterState.ADDING_INTERACTION) {
        if (!selectedInteractionSourceLocalId) {
          setSelectedInteractionSourceLocalId(localId);
          return;
        }
        if (localId === selectedInteractionSourceLocalId) return;
        setSelectedInteractionTargetLocalIds((current) =>
          current.includes(localId) ?
            current.filter((id) => id !== localId)
          : [...current, localId],
        );

        return;
      }
      if (footerState === BehavioralMapFooterState.ADDING_OBSERVATION) return;
      setSelectedInteractionLocalId(null);
      setSelectedGroupLocalId(null);
      setSelectedObservationLocalId(localId);
      setFooterState(BehavioralMapFooterState.OBSERVATION_SELECTED);
    },
    [footerState, selectedInteractionSourceLocalId, selectedObservationLocalId],
  );

  const handleCloseSelectedObservation = useCallback(() => {
    setSelectedInteractionLocalId(null);
    setSelectedObservationLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleStartAddingInteraction = useCallback(() => {
    setSelectedObservationLocalId(null);
    setSelectedGroupLocalId(null);
    setSelectedInteractionLocalId(null);
    setSelectedInteractionSourceLocalId(null);
    setInteractionDescription("");
    setSelectedInteractionTargetLocalIds([]);
    setIsSelfInteractionSelected(false);
    setFooterState(BehavioralMapFooterState.ADDING_INTERACTION);
  }, []);

  const handleCancelInteraction = useCallback(() => {
    setSelectedInteractionSourceLocalId(null);
    setSelectedInteractionTargetLocalIds([]);
    setIsSelfInteractionSelected(false);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleConfirmInteraction = useCallback(() => {
    if (!selectedInteractionSourceLocalId || !interactionDescription.trim())
      return;
    const destinationIds = [...selectedInteractionTargetLocalIds];
    if (isSelfInteractionSelected)
      destinationIds.push(selectedInteractionSourceLocalId);
    if (destinationIds.length === 0) return;
    setInteractions((current) => [
      ...current,
      ...destinationIds.map((observationBLocalId) => ({
        localId: `local-interaction-${crypto.randomUUID()}`,
        observationALocalId: selectedInteractionSourceLocalId,
        observationBLocalId,
        description: interactionDescription.trim(),
      })),
    ]);
    setSelectedInteractionSourceLocalId(null);
    setSelectedInteractionTargetLocalIds([]);
    setIsSelfInteractionSelected(false);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, [
    interactionDescription,
    isSelfInteractionSelected,
    selectedInteractionTargetLocalIds,
    selectedInteractionSourceLocalId,
  ]);

  const selectedInteraction = useMemo(
    () =>
      interactions.find(
        ({ localId }) => localId === selectedInteractionLocalId,
      ) ?? null,
    [interactions, selectedInteractionLocalId],
  );

  const selectedObservation = useMemo(
    () =>
      observations.find(
        ({ localId }) => localId === selectedObservationLocalId,
      ) ?? null,
    [observations, selectedObservationLocalId],
  );

  const handleStartAddingGroup = useCallback(() => {
    setSelectedObservationLocalId(null);
    setSelectedInteractionLocalId(null);
    setSelectedGroupLocalId(null);
    setGroupLabel("");
    setSelectedGroupTargetLocalIds([]);
    setFooterState(BehavioralMapFooterState.ADDING_GROUP);
  }, []);

  const handleCancelGroup = useCallback(() => {
    setSelectedGroupTargetLocalIds([]);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleConfirmGroup = useCallback(() => {
    if (selectedGroupTargetLocalIds.length === 0 || !groupLabel.trim()) return;
    const groupLocalId = `local-group-${crypto.randomUUID()}`;
    const memberIds = new Set(selectedGroupTargetLocalIds);
    setBehavioralMapGroups((current) => [
      ...current,
      { localId: groupLocalId, label: groupLabel.trim() },
    ]);
    setObservations((current) =>
      current.map((observation) =>
        memberIds.has(observation.localId) ?
          {
            ...observation,
            groupLocalIds: [...observation.groupLocalIds, groupLocalId],
          }
        : observation,
      ),
    );
    setSelectedGroupTargetLocalIds([]);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, [groupLabel, selectedGroupTargetLocalIds]);

  const selectedGroup = useMemo(
    () =>
      behavioralMapGroups.find(
        ({ localId }) => localId === selectedGroupLocalId,
      ) ?? null,
    [behavioralMapGroups, selectedGroupLocalId],
  );

  const handleGroupClick = useCallback((localId: string) => {
    setSelectedObservationLocalId(null);
    setSelectedInteractionLocalId(null);
    setSelectedGroupLocalId(localId);
    setFooterState(BehavioralMapFooterState.EDITING_GROUP);
  }, []);

  const handleGroupLabelEdit = useCallback(
    (label: string) => {
      if (!selectedGroupLocalId) return;
      setBehavioralMapGroups((current) =>
        current.map((group) =>
          group.localId === selectedGroupLocalId ? { ...group, label } : group,
        ),
      );
    },
    [selectedGroupLocalId],
  );

  const handleBackFromGroupEdit = useCallback(() => {
    setSelectedGroupLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleDeleteGroup = useCallback(() => {
    if (!selectedGroupLocalId) return;
    setBehavioralMapGroups((current) =>
      current.filter(({ localId }) => localId !== selectedGroupLocalId),
    );
    setObservations((current) =>
      current.map((observation) =>
        observation.groupLocalIds.includes(selectedGroupLocalId) ?
          {
            ...observation,
            groupLocalIds: observation.groupLocalIds.filter(
              (groupLocalId) => groupLocalId !== selectedGroupLocalId,
            ),
          }
        : observation,
      ),
    );
    setSelectedGroupLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, [selectedGroupLocalId]);

  const handleInteractionClick = useCallback((localId: string) => {
    setSelectedObservationLocalId(null);
    setSelectedGroupLocalId(null);
    setSelectedInteractionLocalId(localId);
    setFooterState(BehavioralMapFooterState.EDITING_INTERACTION);
  }, []);

  const handleInteractionDescriptionEdit = useCallback(
    (description: string) => {
      if (!selectedInteractionLocalId) return;
      setInteractions((current) =>
        current.map((interaction) =>
          interaction.localId === selectedInteractionLocalId ?
            { ...interaction, description }
          : interaction,
        ),
      );
    },
    [selectedInteractionLocalId],
  );

  const handleBackFromInteractionEdit = useCallback(() => {
    setSelectedInteractionLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleDeleteInteraction = useCallback(() => {
    if (!selectedInteractionLocalId) return;
    setInteractions((current) =>
      current.filter(({ localId }) => localId !== selectedInteractionLocalId),
    );
    setSelectedInteractionLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, [selectedInteractionLocalId]);

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
        interactions={interactions}
        selectedInteractionTargetLocalIds={selectedInteractionTargetLocalIds}
        personGroups={behavioralMapGroups}
        selectedGroupTargetLocalIds={selectedGroupTargetLocalIds}
        selectedGroupLocalId={selectedGroupLocalId}
        selectedInteractionLocalId={selectedInteractionLocalId}
        selectedInteractionSourceLocalId={selectedInteractionSourceLocalId}
        pendingPosition={pendingPosition}
        selectedObservationLocalId={
          selectedInteractionSourceLocalId ?? selectedObservationLocalId
        }
        onMapClick={handleMapClick}
        onObservationClick={handleObservationClick}
        onInteractionClick={handleInteractionClick}
        onGroupClick={handleGroupClick}
      />

      <BehavioralMapFooter
        state={footerState}
        groups={groups}
        observedAt={pendingPosition?.observedAt ?? new Date()}
        selectedObservation={selectedObservation}
        onCancel={handleCancelObservation}
        onSubmitObservation={handleSubmitObservation}
        onCloseSelectedObservation={handleCloseSelectedObservation}
        selectedInteraction={selectedInteraction}
        selectedGroup={selectedGroup}
        onGroupLabelEdit={handleGroupLabelEdit}
        onBackFromGroupEdit={handleBackFromGroupEdit}
        onDeleteGroup={handleDeleteGroup}
        interactionDescription={interactionDescription}
        hasInteractionSource={selectedInteractionSourceLocalId !== null}
        selectedInteractionTargetCount={
          selectedInteractionTargetLocalIds.length +
          (isSelfInteractionSelected ? 1 : 0)
        }
        isSelfInteractionSelected={isSelfInteractionSelected}
        onInteractionDescriptionChange={setInteractionDescription}
        onSelfInteractionChange={setIsSelfInteractionSelected}
        onCancelInteraction={handleCancelInteraction}
        onConfirmInteraction={handleConfirmInteraction}
        onInteractionDescriptionEdit={handleInteractionDescriptionEdit}
        onBackFromInteractionEdit={handleBackFromInteractionEdit}
        onDeleteInteraction={handleDeleteInteraction}
        onAddInteraction={handleStartAddingInteraction}
        groupLabel={groupLabel}
        selectedGroupCount={selectedGroupTargetLocalIds.length}
        onGroupLabelChange={setGroupLabel}
        onCancelGroup={handleCancelGroup}
        onConfirmGroup={handleConfirmGroup}
        onAddGroup={handleStartAddingGroup}
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
        observations={observations}
        interactions={interactions.map(
          ({ localId: _localId, ...interaction }) => interaction,
        )}
        groups={behavioralMapGroups}
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
