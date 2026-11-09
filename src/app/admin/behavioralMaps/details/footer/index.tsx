"use client";

import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";

import type {
  BehavioralMapGroup,
  BehavioralMapInteraction,
} from "../observationState";
import AddingGroupState from "./addingGroupState";
import AddingInteractionState from "./addingInteractionState";
import AddingObservationState from "./addingObservationState";
import EditingGroupState from "./editingGroupState";
import EditingInteractionState from "./editingInteractionState";
import { BehavioralMapFooterState } from "./footerState";
import IdleState from "./idleState";
import ObservationSelectedState from "./observationSelectedState";

type Details = FetchBehavioralMapDetailsResponse["behavioralMapDetails"];
type ProtocolGroups =
  Details["behavioralMapSubmission"]["behavioralMapProtocolStructure"]["behavioralMapProtocolGroups"];

const BehavioralMapFooter = ({
  state,
  groups,
  observedAt,
  selectedObservation,
  onCancel,
  onSubmitObservation,
  onCloseSelectedObservation,
  interactionDescription,
  hasInteractionSource,
  selectedInteractionTargetCount,
  isSelfInteractionSelected,
  onInteractionDescriptionChange,
  onSelfInteractionChange,
  onCancelInteraction,
  onConfirmInteraction,
  selectedInteraction,
  selectedGroup,
  onGroupLabelEdit,
  onBackFromGroupEdit,
  onDeleteGroup,
  onInteractionDescriptionEdit,
  onBackFromInteractionEdit,
  onDeleteInteraction,
  onAddGroup,
  groupLabel,
  selectedGroupCount,
  onGroupLabelChange,
  onCancelGroup,
  onConfirmGroup,
  onAddInteraction,
  onOpenForm,
  onOpenEvaluation,
  onOpenSave,
}: {
  state: BehavioralMapFooterState;
  groups: ProtocolGroups;
  observedAt: Date;
  selectedObservation: {
    quantity: number;
    observedAt: Date;
    personCharacteristicIds: number[];
  } | null;
  onCancel: () => void;
  onSubmitObservation: (
    personCharacteristicIds: number[],
    quantity: number,
  ) => void;
  onCloseSelectedObservation: () => void;
  onAddInteraction: () => void;
  onAddGroup: () => void;
  groupLabel: string;
  selectedGroupCount: number;
  onGroupLabelChange: (value: string) => void;
  onCancelGroup: () => void;
  onConfirmGroup: () => void;
  interactionDescription: string;
  hasInteractionSource: boolean;
  selectedInteractionTargetCount: number;
  isSelfInteractionSelected: boolean;
  onInteractionDescriptionChange: (value: string) => void;
  onSelfInteractionChange: (checked: boolean) => void;
  onCancelInteraction: () => void;
  onConfirmInteraction: () => void;
  selectedInteraction: BehavioralMapInteraction | null;
  selectedGroup: BehavioralMapGroup | null;
  onGroupLabelEdit: (value: string) => void;
  onBackFromGroupEdit: () => void;
  onDeleteGroup: () => void;
  onInteractionDescriptionEdit: (value: string) => void;
  onBackFromInteractionEdit: () => void;
  onDeleteInteraction: () => void;
  onOpenForm?: () => void;
  onOpenEvaluation?: () => void;
  onOpenSave?: () => void;
}) => (
  <footer className="flex h-1/2 min-h-0 flex-col border-t border-gray-300">
    {state === BehavioralMapFooterState.IDLE ?
      <IdleState
        onOpenForm={onOpenForm}
        onOpenEvaluation={onOpenEvaluation}
        onOpenSave={onOpenSave}
        onCreateGroup={onAddGroup}
        onCreateInteraction={onAddInteraction}
      />
    : state === BehavioralMapFooterState.ADDING_OBSERVATION ?
      <AddingObservationState
        groups={groups}
        observedAt={observedAt}
        onCancel={onCancel}
        onSubmitObservation={onSubmitObservation}
      />
    : state === BehavioralMapFooterState.ADDING_GROUP ?
      <AddingGroupState
        label={groupLabel}
        selectedCount={selectedGroupCount}
        onLabelChange={onGroupLabelChange}
        onCancel={onCancelGroup}
        onConfirm={onConfirmGroup}
      />
    : state === BehavioralMapFooterState.ADDING_INTERACTION ?
      <AddingInteractionState
        description={interactionDescription}
        selectedCount={selectedInteractionTargetCount}
        hasSource={hasInteractionSource}
        isSelfInteractionSelected={isSelfInteractionSelected}
        onDescriptionChange={onInteractionDescriptionChange}
        onSelfInteractionChange={onSelfInteractionChange}
        onCancel={onCancelInteraction}
        onConfirm={onConfirmInteraction}
      />
    : state === BehavioralMapFooterState.EDITING_GROUP && selectedGroup ?
      <EditingGroupState
        label={selectedGroup.label}
        onLabelChange={onGroupLabelEdit}
        onBack={onBackFromGroupEdit}
        onDelete={onDeleteGroup}
      />
    : (
      state === BehavioralMapFooterState.EDITING_INTERACTION &&
      selectedInteraction
    ) ?
      <EditingInteractionState
        description={selectedInteraction.description}
        onDescriptionChange={onInteractionDescriptionEdit}
        onBack={onBackFromInteractionEdit}
        onDelete={onDeleteInteraction}
      />
    : selectedObservation ?
      <ObservationSelectedState
        observation={selectedObservation}
        groups={groups}
        onClose={onCloseSelectedObservation}
      />
    : <IdleState
        onOpenForm={onOpenForm}
        onOpenEvaluation={onOpenEvaluation}
        onOpenSave={onOpenSave}
        onCreateGroup={onAddGroup}
        onCreateInteraction={onAddInteraction}
      />
    }
  </footer>
);

export { BehavioralMapFooterState };
export default BehavioralMapFooter;
