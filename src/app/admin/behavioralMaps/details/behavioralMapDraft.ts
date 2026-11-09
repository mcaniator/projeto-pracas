import { dexieDb } from "@/lib/dexie/dexie";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { Capacitor } from "@capacitor/core";

import type {
  BehavioralMapGroup,
  BehavioralMapObservation,
  BehavioralMapObservationLink,
  BehavioralMapResponseGeometryLink,
} from "./observationState";

export type BehavioralMapDraftValues = {
  isFinalized: boolean;
  startDate: Date;
  endDate: Date | null;
  responseFormValues: SerializedFormValues;
  geometries: ResponseFormGeometry[];
  observations: BehavioralMapObservation[];
  groups: BehavioralMapGroup[];
  observationLinks: BehavioralMapObservationLink[];
  responseGeometryLinks: BehavioralMapResponseGeometryLink[];
};

export type BehavioralMapDraft = BehavioralMapDraftValues & {
  id: number;
  userId: string;
  username: string;
  savedUpdatedAt: Date;
  draftUpdatedAt: Date;
};

export const saveBehavioralMapDraft = async (draft: BehavioralMapDraft) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return;
  }

  await dexieDb.behavioralMapDrafts.put(draft);
};

export const deleteBehavioralMapDraft = async (behavioralMapId: number) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return;
  }
  await dexieDb.behavioralMapDrafts.delete(behavioralMapId);
};

export const fetchBehavioralMapDraft = async (behavioralMapId: number) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return null;
  }

  const draft = await dexieDb.behavioralMapDrafts.get(behavioralMapId);
  return draft ?? null;
};

export const fetchBehavioralMapDraftIds = async () => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return new Set<number>();
  }

  const behavioralMapIds = await dexieDb.behavioralMapDrafts
    .toCollection()
    .primaryKeys();
  const behavioralMapIdsSet = new Set<number>();

  behavioralMapIds.forEach((id) => {
    behavioralMapIdsSet.add(id);
  });

  return behavioralMapIdsSet;
};
