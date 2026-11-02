export type BehavioralMapPosition = [longitude: number, latitude: number];

export type BehavioralMapObservation = {
  localId: string;
  position: BehavioralMapPosition;
  observedAt: Date;
  quantity: number;
  personCharacteristicIds: number[];
};

export type BehavioralMapPendingPosition = {
  position: BehavioralMapPosition;
  observedAt: Date;
};
