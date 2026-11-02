"use client";

import type { FetchBehavioralMapDetailsResponse } from "@/lib/serverFunctions/queries/behavioralMap";

import AddingObservationState from "./addingObservationState";
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
      />
    : state === BehavioralMapFooterState.ADDING_OBSERVATION ?
      <AddingObservationState
        groups={groups}
        observedAt={observedAt}
        onCancel={onCancel}
        onSubmitObservation={onSubmitObservation}
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
      />
    }
  </footer>
);

export { BehavioralMapFooterState };
export default BehavioralMapFooter;
