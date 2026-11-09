export type BehavioralMapPosition = [longitude: number, latitude: number];

export type BehavioralMapObservation = {
  localId: string;
  groupLocalIds: string[];
  position: BehavioralMapPosition;
  observedAt: Date;
  quantity: number;
  personCharacteristicIds: number[];
};

export type BehavioralMapInteraction = {
  localId: string;
  observationALocalId: string;
  observationBLocalId: string;
  description: string;
};

export type BehavioralMapPendingPosition = {
  position: BehavioralMapPosition;
  observedAt: Date;
};

export type BehavioralMapGroup = {
  localId: string;
  label: string;
};
