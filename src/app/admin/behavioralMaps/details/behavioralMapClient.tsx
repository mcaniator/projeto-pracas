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
  BehavioralMapLink,
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

  const [links, setLinks] = useState<BehavioralMapLink[]>(
    () =>
      behavioralMapSubmission.personObservations.flatMap((observation) =>
        observation.linksAsObservationA.map((link) => ({
          localId: `saved-link-${link.id}`,
          observationALocalId: `saved-${observation.id}`,
          observationBLocalId: `saved-${link.observationBId}`,
          description: link.description,
        })),
      ),
  );
  const [groupLabel, setGroupLabel] = useState("");
  const [selectedGroupTargetLocalIds, setSelectedGroupTargetLocalIds] =
    useState<string[]>([]);
  const [linkDescription, setLinkDescription] = useState("");
  const [
    selectedLinkSourceLocalId,
    setSelectedLinkSourceLocalId,
  ] = useState<string | null>(null);
  const [
    selectedLinkTargetLocalIds,
    setSelectedLinkTargetLocalIds,
  ] = useState<string[]>([]);
  const [isSelfLinkSelected, setIsSelfLinkSelected] =
    useState(false);

  const [pendingPosition, setPendingPosition] =
    useState<BehavioralMapPendingPosition | null>(null);
  const [footerState, setFooterState] = useState<BehavioralMapFooterState>(
    BehavioralMapFooterState.IDLE,
  );
  const [selectedLinkLocalId, setSelectedLinkLocalId] = useState<
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
        footerState === BehavioralMapFooterState.ADDING_LINK ||
        footerState === BehavioralMapFooterState.ADDING_GROUP ||
        footerState === BehavioralMapFooterState.EDITING_LINK ||
        footerState === BehavioralMapFooterState.EDITING_GROUP ||
        pendingPosition
      ) {
        return;
      }

      setSelectedObservationLocalId(null);
      setSelectedLinkLocalId(null);
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
      if (footerState === BehavioralMapFooterState.ADDING_LINK) {
        if (!selectedLinkSourceLocalId) {
          setSelectedLinkSourceLocalId(localId);
          return;
        }
        if (localId === selectedLinkSourceLocalId) return;
        setSelectedLinkTargetLocalIds((current) =>
          current.includes(localId) ?
            current.filter((id) => id !== localId)
          : [...current, localId],
        );

        return;
      }
      if (footerState === BehavioralMapFooterState.ADDING_OBSERVATION) return;
      setSelectedLinkLocalId(null);
      setSelectedGroupLocalId(null);
      setSelectedObservationLocalId(localId);
      setFooterState(BehavioralMapFooterState.OBSERVATION_SELECTED);
    },
    [footerState, selectedLinkSourceLocalId, selectedObservationLocalId],
  );

  const handleCloseSelectedObservation = useCallback(() => {
    setSelectedLinkLocalId(null);
    setSelectedObservationLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleStartAddingLink = useCallback(() => {
    setSelectedObservationLocalId(null);
    setSelectedGroupLocalId(null);
    setSelectedLinkLocalId(null);
    setSelectedLinkSourceLocalId(null);
    setLinkDescription("");
    setSelectedLinkTargetLocalIds([]);
    setIsSelfLinkSelected(false);
    setFooterState(BehavioralMapFooterState.ADDING_LINK);
  }, []);

  const handleCancelLink = useCallback(() => {
    setSelectedLinkSourceLocalId(null);
    setSelectedLinkTargetLocalIds([]);
    setIsSelfLinkSelected(false);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleConfirmLink = useCallback(() => {
    if (!selectedLinkSourceLocalId || !linkDescription.trim())
      return;
    const destinationIds = [...selectedLinkTargetLocalIds];
    if (isSelfLinkSelected)
      destinationIds.push(selectedLinkSourceLocalId);
    if (destinationIds.length === 0) return;
    setLinks((current) => [
      ...current,
      ...destinationIds.map((observationBLocalId) => ({
        localId: `local-link-${crypto.randomUUID()}`,
        observationALocalId: selectedLinkSourceLocalId,
        observationBLocalId,
        description: linkDescription.trim(),
      })),
    ]);
    setSelectedLinkSourceLocalId(null);
    setSelectedLinkTargetLocalIds([]);
    setIsSelfLinkSelected(false);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, [
    linkDescription,
    isSelfLinkSelected,
    selectedLinkTargetLocalIds,
    selectedLinkSourceLocalId,
  ]);

  const selectedLink = useMemo(
    () =>
      links.find(
        ({ localId }) => localId === selectedLinkLocalId,
      ) ?? null,
    [links, selectedLinkLocalId],
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
    setSelectedLinkLocalId(null);
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
    setSelectedLinkLocalId(null);
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

  const handleLinkClick = useCallback((localId: string) => {
    setSelectedObservationLocalId(null);
    setSelectedGroupLocalId(null);
    setSelectedLinkLocalId(localId);
    setFooterState(BehavioralMapFooterState.EDITING_LINK);
  }, []);

  const handleLinkDescriptionEdit = useCallback(
    (description: string) => {
      if (!selectedLinkLocalId) return;
      setLinks((current) =>
        current.map((link) =>
          link.localId === selectedLinkLocalId ?
            { ...link, description }
          : link,
        ),
      );
    },
    [selectedLinkLocalId],
  );

  const handleBackFromLinkEdit = useCallback(() => {
    setSelectedLinkLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleDeleteLink = useCallback(() => {
    if (!selectedLinkLocalId) return;
    setLinks((current) =>
      current.filter(({ localId }) => localId !== selectedLinkLocalId),
    );
    setSelectedLinkLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, [selectedLinkLocalId]);

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
        links={links}
        selectedLinkTargetLocalIds={selectedLinkTargetLocalIds}
        personGroups={behavioralMapGroups}
        selectedGroupTargetLocalIds={selectedGroupTargetLocalIds}
        selectedGroupLocalId={selectedGroupLocalId}
        selectedLinkLocalId={selectedLinkLocalId}
        selectedLinkSourceLocalId={selectedLinkSourceLocalId}
        pendingPosition={pendingPosition}
        selectedObservationLocalId={
          selectedLinkSourceLocalId ?? selectedObservationLocalId
        }
        onMapClick={handleMapClick}
        onObservationClick={handleObservationClick}
        onLinkClick={handleLinkClick}
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
        selectedLink={selectedLink}
        selectedGroup={selectedGroup}
        onGroupLabelEdit={handleGroupLabelEdit}
        onBackFromGroupEdit={handleBackFromGroupEdit}
        onDeleteGroup={handleDeleteGroup}
        linkDescription={linkDescription}
        hasLinkSource={selectedLinkSourceLocalId !== null}
        selectedLinkTargetCount={
          selectedLinkTargetLocalIds.length +
          (isSelfLinkSelected ? 1 : 0)
        }
        isSelfLinkSelected={isSelfLinkSelected}
        onLinkDescriptionChange={setLinkDescription}
        onSelfLinkChange={setIsSelfLinkSelected}
        onCancelLink={handleCancelLink}
        onConfirmLink={handleConfirmLink}
        onLinkDescriptionEdit={handleLinkDescriptionEdit}
        onBackFromLinkEdit={handleBackFromLinkEdit}
        onDeleteLink={handleDeleteLink}
        onAddLink={handleStartAddingLink}
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
        links={links.map(
          ({ localId: _localId, ...link }) => link,
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
