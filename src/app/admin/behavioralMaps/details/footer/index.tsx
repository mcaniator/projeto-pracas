"use client";

import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";

import type {
  BehavioralMapGroup,
  BehavioralMapLink,
  BehavioralMapObservation,
} from "../observationState";
import AddingGroupState from "./addingGroupState";
import AddingLinkState from "./addingLinkState";
import AddingObservationState from "./addingObservationState";
import EditingGroupState from "./editingGroupState";
import EditingLinkState from "./editingLinkState";
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
  linkDescription,
  hasLinkSource,
  selectedLinkTargetCount,
  isSelfLinkSelected,
  onLinkDescriptionChange,
  onSelfLinkChange,
  onCancelLink,
  onConfirmLink,
  selectedLink,
  selectedGroup,
  onGroupLabelEdit,
  onBackFromGroupEdit,
  onDeleteGroup,
  onLinkDescriptionEdit,
  onBackFromLinkEdit,
  onDeleteLink,
  onAddGroup,
  groupLabel,
  selectedGroupCount,
  onGroupLabelChange,
  onCancelGroup,
  onConfirmGroup,
  onAddLink,
  onOpenForm,
  onOpenEvaluation,
  onOpenStatistics,
  onOpenSave,
}: {
  state: BehavioralMapFooterState;
  groups: ProtocolGroups;
  observedAt: Date;
  selectedObservation: BehavioralMapObservation | null;
  onCancel: () => void;
  onSubmitObservation: (
    characteristics: BehavioralMapObservation["characteristics"],
    quantity: number,
  ) => void;
  onCloseSelectedObservation: () => void;
  onAddLink: () => void;
  onAddGroup: () => void;
  groupLabel: string;
  selectedGroupCount: number;
  onGroupLabelChange: (value: string) => void;
  onCancelGroup: () => void;
  onConfirmGroup: () => void;
  linkDescription: string;
  hasLinkSource: boolean;
  selectedLinkTargetCount: number;
  isSelfLinkSelected: boolean;
  onLinkDescriptionChange: (value: string) => void;
  onSelfLinkChange: (checked: boolean) => void;
  onCancelLink: () => void;
  onConfirmLink: () => void;
  selectedLink: BehavioralMapLink | null;
  selectedGroup: BehavioralMapGroup | null;
  onGroupLabelEdit: (value: string) => void;
  onBackFromGroupEdit: () => void;
  onDeleteGroup: () => void;
  onLinkDescriptionEdit: (value: string) => void;
  onBackFromLinkEdit: () => void;
  onDeleteLink: () => void;
  onOpenForm?: () => void;
  onOpenEvaluation?: () => void;
  onOpenStatistics: () => void;
  onOpenSave?: () => void;
}) => (
  <footer className="flex h-1/3 min-h-0 flex-col border-t border-gray-300">
    {state === BehavioralMapFooterState.IDLE ?
      <IdleState
        onOpenForm={onOpenForm}
        onOpenEvaluation={onOpenEvaluation}
        onOpenStatistics={onOpenStatistics}
        onOpenSave={onOpenSave}
        onCreateGroup={onAddGroup}
        onCreateLink={onAddLink}
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
    : state === BehavioralMapFooterState.ADDING_LINK ?
      <AddingLinkState
        description={linkDescription}
        selectedCount={selectedLinkTargetCount}
        hasSource={hasLinkSource}
        isSelfLinkSelected={isSelfLinkSelected}
        onDescriptionChange={onLinkDescriptionChange}
        onSelfLinkChange={onSelfLinkChange}
        onCancel={onCancelLink}
        onConfirm={onConfirmLink}
      />
    : state === BehavioralMapFooterState.EDITING_GROUP && selectedGroup ?
      <EditingGroupState
        label={selectedGroup.label}
        onLabelChange={onGroupLabelEdit}
        onBack={onBackFromGroupEdit}
        onDelete={onDeleteGroup}
      />
    : (
      state === BehavioralMapFooterState.EDITING_LINK &&
      selectedLink
    ) ?
      <EditingLinkState
        description={selectedLink.description}
        onDescriptionChange={onLinkDescriptionEdit}
        onBack={onBackFromLinkEdit}
        onDelete={onDeleteLink}
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
        onOpenStatistics={onOpenStatistics}
        onOpenSave={onOpenSave}
        onCreateGroup={onAddGroup}
        onCreateLink={onAddLink}
      />
    }
  </footer>
);

export { BehavioralMapFooterState };
export default BehavioralMapFooter;
