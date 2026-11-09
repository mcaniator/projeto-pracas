export type BehavioralMapPosition = [longitude: number, latitude: number];

export type BehavioralMapObservation = {
  localId: string;
  groupLocalIds: string[];
  position: BehavioralMapPosition;
  observedAt: Date;
  quantity: number;
  characteristics: { personCharacteristicId: number }[];
};

type BehavioralMapLinkBase = {
  localId: string;
  observationALocalId: string;
  description: string;
};

export type BehavioralMapObservationLink = BehavioralMapLinkBase & {
  observationBLocalId: string;
  responseGeometryLocalId?: never;
};

export type BehavioralMapResponseGeometryLink = BehavioralMapLinkBase & {
  observationBLocalId?: never;
  responseGeometryLocalId: string;
};

export type BehavioralMapLink =
  | BehavioralMapObservationLink
  | BehavioralMapResponseGeometryLink;

export type BehavioralMapPendingPosition = {
  position: BehavioralMapPosition;
  observedAt: Date;
};

export type BehavioralMapGroup = {
  localId: string;
  label: string;
};
