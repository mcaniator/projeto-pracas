"use client";

import RevertTallyDraftDialog from "@/app/admin/tallys/details/revertTallyDraftDialog";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type { ResponseFormV2Handle } from "@/components/ui/responseForm/responseFormV2";
import dayjs from "@/lib/dayjs";
import type { SaveBehavioralMapResponse } from "@/lib/serverFunctions/mutations/behavioralMapSubmission";
import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { enqueueSnackbar } from "notistack";
import { useCallback, useMemo, useRef, useState } from "react";

import type { BehavioralMapDraftValues } from "./behavioralMapDraft";
import BehavioralMapEvaluationDialog from "./behavioralMapEvaluationDialog";
import BehavioralMapFormDialog from "./behavioralMapFormDialog";
import BehavioralMapMap from "./behavioralMapMap";
import BehavioralMapPersonsDialog from "./behavioralMapPersonsDialog";
import BehavioralMapSaveDialog from "./behavioralMapSaveDialog";
import ChooseBehavioralMapSourceDialog from "./chooseBehavioralMapSourceDialog";
import DeleteBehavioralMapDialog from "./deleteBehavioralMapDialog";
import BehavioralMapFooter, { BehavioralMapFooterState } from "./footer";
import type {
  BehavioralMapGroup,
  BehavioralMapLink,
  BehavioralMapObservation,
  BehavioralMapObservationLink,
  BehavioralMapPendingPosition,
  BehavioralMapResponseGeometryLink,
} from "./observationState";
import useBehavioralMapDraft from "./useBehavioralMapDraft";

type BehavioralMapDetails =
  FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  BehavioralMapDetails["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const keepLinksToExistingGeometries = (
  links: BehavioralMapResponseGeometryLink[],
  geometries: ResponseFormGeometry[],
) => {
  const geometryIds = new Set(
    geometries.flatMap(({ geometries }) =>
      geometries.map(({ localId }) => localId),
    ),
  );
  const remainingLinks = links.filter(
    ({ responseGeometryLocalId }) => geometryIds.has(responseGeometryLocalId),
  );
  return remainingLinks.length === links.length ? links : remainingLinks;
};

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
  const [openRevertDraftDialog, setOpenRevertDraftDialog] = useState(false);
  const [openDeleteBehavioralMapDialog, setOpenDeleteBehavioralMapDialog] =
    useState(false);
  const [isStatisticsDialogOpen, setIsStatisticsDialogOpen] = useState(false);
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
            characteristics: observation.characteristics,
          },
        ];
      }),
  );

  const [observationLinks, setObservationLinks] = useState<
    BehavioralMapObservationLink[]
  >(() => {
    const observationIds = new Set(observations.map(({ localId }) => localId));
    return behavioralMapSubmission.personObservations.flatMap((observation) => {
      if (!observation.position) return [];
      return observation.linksAsObservationA
        .filter((link) => observationIds.has(`saved-${link.observationBId}`))
        .map((link) => ({
          localId: `saved-link-${link.id}`,
          observationALocalId: `saved-${observation.id}`,
          observationBLocalId: `saved-${link.observationBId}`,
          description: link.description,
        }));
    });
  });
  const [responseGeometryLinks, setResponseGeometryLinks] = useState<
    BehavioralMapResponseGeometryLink[]
  >(() => {
    const geometryIds = new Set(
      formSubmission?.geometries.flatMap(({ geometries }) =>
        geometries.map(({ localId }) => localId),
      ),
    );
    return behavioralMapSubmission.personObservations.flatMap((observation) => {
      if (!observation.position) return [];
      return observation.responseGeometryLinks
        .filter((link) => geometryIds.has(String(link.responseGeometryId)))
        .map((link) => ({
          localId: `saved-geometry-link-${observation.id}-${link.responseGeometryId}`,
          observationALocalId: `saved-${observation.id}`,
          responseGeometryLocalId: String(link.responseGeometryId),
          description: link.description,
        }));
    });
  });
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
  const [selectedGeometryTargetLocalIds, setSelectedGeometryTargetLocalIds] =
    useState<string[]>([]);
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
  const responseFormRef = useRef<ResponseFormV2Handle>(null);

  const draftValues = useMemo<BehavioralMapDraftValues>(
    () => ({
      isFinalized,
      startDate: startDate.toDate(),
      endDate: endDate?.toDate() ?? null,
      responseFormValues: serializedFormValues,
      geometries,
      observations,
      groups: behavioralMapGroups,
      observationLinks,
      responseGeometryLinks,
    }),
    [
      behavioralMapGroups,
      endDate,
      geometries,
      isFinalized,
      observationLinks,
      observations,
      responseGeometryLinks,
      serializedFormValues,
      startDate,
    ],
  );
  const restoreDraftValues = useCallback((values: BehavioralMapDraftValues) => {
    responseFormRef.current?.reset({
      responsesFormValues: values.responseFormValues,
      geometries: values.geometries,
    });
    setIsFinalized(values.isFinalized);
    setStartDate(dayjs(values.startDate));
    setEndDate(values.endDate ? dayjs(values.endDate) : null);
    setSerializedFormValues(values.responseFormValues);
    setGeometries(values.geometries);
    setObservations(values.observations);
    setBehavioralMapGroups(values.groups);
    setObservationLinks(values.observationLinks);
    setResponseGeometryLinks(values.responseGeometryLinks);
  }, []);
  const {
    isDraftLoaded,
    draftUpdatedAt,
    savedVersionUpdatedAt,
    pendingDraftChoice,
    applyDraft,
    applySavedVersion,
    scheduleDraftSave,
    clearDraft,
    markSaved,
  } = useBehavioralMapDraft({
    behavioralMapId: behavioralMapDetails.id,
    ownerId: behavioralMapDetails.user.id,
    savedUpdatedAt: behavioralMapDetails.updatedAt,
    values: draftValues,
    onRestore: restoreDraftValues,
  });

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
    (
      characteristics: BehavioralMapObservation["characteristics"],
      quantity: number,
    ) => {
      if (!pendingPosition || quantity < 1) return;

      const observation: BehavioralMapObservation = {
        localId: "local-" + crypto.randomUUID(),
        groupLocalIds: [],
        position: pendingPosition.position,
        observedAt: pendingPosition.observedAt,
        quantity,
        characteristics,
      };

      setObservations((current) => [...current, observation]);
      setPendingPosition(null);
      setFooterState(BehavioralMapFooterState.IDLE);

      const selectedCharacteristics = groups.flatMap((group) =>
        group.characteristics.filter(({ personCharacteristic }) =>
          characteristics.some(
            ({ personCharacteristicId }) =>
              personCharacteristicId === personCharacteristic.id,
          ),
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
    setSelectedGeometryTargetLocalIds([]);
    setIsSelfLinkSelected(false);
    setFooterState(BehavioralMapFooterState.ADDING_LINK);
  }, []);

  const handleCancelLink = useCallback(() => {
    setSelectedLinkSourceLocalId(null);
    setSelectedLinkTargetLocalIds([]);
    setSelectedGeometryTargetLocalIds([]);
    setIsSelfLinkSelected(false);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleFormGeometryClick = useCallback((localId: string) => {
    setSelectedGeometryTargetLocalIds((current) =>
      current.includes(localId) ?
        current.filter((id) => id !== localId)
      : [...current, localId],
    );
  }, []);

  const handleConfirmLink = useCallback(() => {
    const description = linkDescription.trim();
    if (!selectedLinkSourceLocalId || !description) return;
    const destinationIds = [...selectedLinkTargetLocalIds];
    if (isSelfLinkSelected) destinationIds.push(selectedLinkSourceLocalId);
    if (
      destinationIds.length === 0 &&
      selectedGeometryTargetLocalIds.length === 0
    )
      return;
    if (destinationIds.length > 0) {
      const newLinks = destinationIds.map((observationBLocalId) => ({
        localId: `local-link-${crypto.randomUUID()}`,
        observationALocalId: selectedLinkSourceLocalId,
        observationBLocalId,
        description,
      }));
      setObservationLinks((current) => [...current, ...newLinks]);
    }
    if (selectedGeometryTargetLocalIds.length > 0) {
      const geometryTargets = new Set(selectedGeometryTargetLocalIds);
      const newLinks = selectedGeometryTargetLocalIds.map(
        (responseGeometryLocalId) => ({
          localId: `local-link-${crypto.randomUUID()}`,
          observationALocalId: selectedLinkSourceLocalId,
          responseGeometryLocalId,
          description,
        }),
      );
      setResponseGeometryLinks((current) => [
        ...current.filter(
          (link) =>
            link.observationALocalId !== selectedLinkSourceLocalId ||
            !geometryTargets.has(link.responseGeometryLocalId),
        ),
        ...newLinks,
      ]);
    }
    handleCancelLink();
  }, [
    handleCancelLink,
    linkDescription,
    isSelfLinkSelected,
    selectedLinkTargetLocalIds,
    selectedGeometryTargetLocalIds,
    selectedLinkSourceLocalId,
  ]);

  const selectedLink = useMemo<BehavioralMapLink | null>(
    () =>
      observationLinks.find(({ localId }) => localId === selectedLinkLocalId) ??
      responseGeometryLinks.find(
        ({ localId }) => localId === selectedLinkLocalId,
      ) ??
      null,
    [observationLinks, responseGeometryLinks, selectedLinkLocalId],
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
    if (footerState === BehavioralMapFooterState.ADDING_LINK) return;
    setSelectedObservationLocalId(null);
    setSelectedLinkLocalId(null);
    setSelectedGroupLocalId(localId);
    setFooterState(BehavioralMapFooterState.EDITING_GROUP);
  }, [footerState]);

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
    if (footerState === BehavioralMapFooterState.ADDING_LINK) return;
    setSelectedObservationLocalId(null);
    setSelectedGroupLocalId(null);
    setSelectedLinkLocalId(localId);
    setFooterState(BehavioralMapFooterState.EDITING_LINK);
  }, [footerState]);

  const handleLinkDescriptionEdit = useCallback(
    (description: string) => {
      if (!selectedLink) return;
      const updateDescription = <T extends BehavioralMapLink,>(link: T) =>
        link.localId === selectedLink.localId ? { ...link, description } : link;
      if (selectedLink.responseGeometryLocalId !== undefined) {
        setResponseGeometryLinks((current) => current.map(updateDescription));
      } else {
        setObservationLinks((current) => current.map(updateDescription));
      }
    },
    [selectedLink],
  );

  const handleBackFromLinkEdit = useCallback(() => {
    setSelectedLinkLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, []);

  const handleDeleteLink = useCallback(() => {
    if (!selectedLink) return;
    const keepLink = ({ localId }: BehavioralMapLink) =>
      localId !== selectedLink.localId;
    if (selectedLink.responseGeometryLocalId !== undefined) {
      setResponseGeometryLinks((current) => current.filter(keepLink));
    } else {
      setObservationLinks((current) => current.filter(keepLink));
    }
    setSelectedLinkLocalId(null);
    setFooterState(BehavioralMapFooterState.IDLE);
  }, [selectedLink]);

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

  const handleFormDraftChange = useCallback(
    (
      updatedSerializedFormValues: SerializedFormValues,
      updatedGeometries: ResponseFormGeometry[],
    ) => {
      scheduleDraftSave({
        ...draftValues,
        responseFormValues: updatedSerializedFormValues,
        geometries: updatedGeometries,
        responseGeometryLinks: updatedGeometries === draftValues.geometries ?
            draftValues.responseGeometryLinks
          : keepLinksToExistingGeometries(
              draftValues.responseGeometryLinks,
              updatedGeometries,
            ),
      });
    },
    [draftValues, scheduleDraftSave],
  );

  const handleFormDialogClose = useCallback(
    (
      updatedSerializedFormValues: SerializedFormValues,
      updatedGeometries: ResponseFormGeometry[],
    ) => {
      setSerializedFormValues(updatedSerializedFormValues);
      setGeometries(updatedGeometries);
      setResponseGeometryLinks((current) =>
        keepLinksToExistingGeometries(current, updatedGeometries),
      );
      setIsFormDialogOpen(false);
    },
    [],
  );
  const handleSaveSuccess = useCallback(
    async ({ updatedAt, savedAsFinalized }: SaveBehavioralMapResponse) => {
      await markSaved(updatedAt, {
        ...draftValues,
        isFinalized: savedAsFinalized,
      });
      setIsFinalized(savedAsFinalized);
    },
    [draftValues, markSaved],
  );

  const handleRevertDraft = async () => {
    if (!(await applySavedVersion())) return;
    setOpenRevertDraftDialog(false);
    enqueueSnackbar("Revertido com sucesso!", { variant: "success" });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-black">
      <BehavioralMapMap
        details={behavioralMapDetails}
        formGeometries={formSubmission ? geometries : undefined}
        groups={groups}
        observations={observations}
        observationLinks={observationLinks}
        responseGeometryLinks={responseGeometryLinks}
        selectedLinkTargetLocalIds={selectedLinkTargetLocalIds}
        selectedGeometryTargetLocalIds={selectedGeometryTargetLocalIds}
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
        onFormGeometryClick={
          footerState === BehavioralMapFooterState.ADDING_LINK &&
          selectedLinkSourceLocalId ?
            handleFormGeometryClick
          : undefined
        }
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
          selectedGeometryTargetLocalIds.length +
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
        onOpenStatistics={() => setIsStatisticsDialogOpen(true)}
        onOpenSave={handleOpenSave}
      />
      <BehavioralMapPersonsDialog
        open={isStatisticsDialogOpen}
        tallyProtocolStructure={{ tallyProtocolGroups: groups }}
        personObservations={observations}
        onClose={() => setIsStatisticsDialogOpen(false)}
      />
      <BehavioralMapEvaluationDialog
        open={isEvaluationDialogOpen}
        protocolName={
          behavioralMapSubmission.behavioralMapProtocolStructure.name
        }
        username={behavioralMapDetails.user.username}
        startDate={startDate}
        onStartDateChange={setStartDate}
        pendingSave={draftUpdatedAt !== undefined}
        onRevertDraft={() => setOpenRevertDraftDialog(true)}
        onDelete={() => setOpenDeleteBehavioralMapDialog(true)}
        onClose={() => setIsEvaluationDialogOpen(false)}
      />
      <RevertTallyDraftDialog
        open={openRevertDraftDialog}
        draftUpdatedAt={draftUpdatedAt}
        savedUpdatedAt={savedVersionUpdatedAt}
        onClose={() => setOpenRevertDraftDialog(false)}
        onConfirm={() => void handleRevertDraft()}
      />
      <DeleteBehavioralMapDialog
        behavioralMapId={behavioralMapDetails.id}
        open={openDeleteBehavioralMapDialog}
        onDeleteSuccess={async () => {
          await clearDraft();
        }}
        onClose={() => setOpenDeleteBehavioralMapDialog(false)}
      />

      {formSubmission && isDraftLoaded && !pendingDraftChoice && (
        <BehavioralMapFormDialog
          open={isFormDialogOpen}
          responseFormRef={responseFormRef}
          formSubmission={formSubmission}
          locationPolygonGeoJson={behavioralMapDetails.location.st_asgeojson}
          serializedFormValues={serializedFormValues}
          geometries={geometries}
          onDraftChange={handleFormDraftChange}
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
        observationLinks={observationLinks}
        responseGeometryLinks={responseGeometryLinks}
        groups={behavioralMapGroups}
        startDate={startDate}
        endDate={endDate}
        isFinalized={isFinalized}
        onSaveSuccess={handleSaveSuccess}
        onEndDateChange={setEndDate}
        onIsFinalizedChange={setIsFinalized}
        onClose={() => setIsSaveDialogOpen(false)}
      />
      {pendingDraftChoice && (
        <ChooseBehavioralMapSourceDialog
          savedSource={{
            username: behavioralMapDetails.user.username,
            updatedAt: behavioralMapDetails.updatedAt,
          }}
          draftSource={{
            username: pendingDraftChoice.username,
            updatedAt: pendingDraftChoice.draftUpdatedAt,
          }}
          onChooseDraft={() => applyDraft(pendingDraftChoice)}
          onChooseSaved={() => void applySavedVersion()}
        />
      )}
    </div>
  );
};

export default BehavioralMapClient;
