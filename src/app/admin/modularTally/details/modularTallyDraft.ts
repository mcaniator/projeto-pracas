import { dexieDb } from "@/lib/dexie/dexie";
import type { ModularTallySubmitData } from "@/lib/serverFunctions/mutations/modularTally";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { Capacitor } from "@capacitor/core";

export type ModularTallyDraft = {
  id: number;
  userId: string;
  username: string;
  savedUpdatedAt: Date;
  draftUpdatedAt: Date;
  isFinalized: boolean;
  startDate: Date;
  endDate: Date | null;
  responseFormValues?: SerializedFormValues;
  geometries?: ResponseFormGeometry[];
  personObservations: ModularTallySubmitData["personObservations"];
};

export const saveModularTallyDraft = async (draft: ModularTallyDraft) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return;
  }

  await dexieDb.modularTallyDrafts.put(draft);
};

export const deleteModularTallyDraft = async (modularTallyId: number) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return;
  }

  await dexieDb.modularTallyDrafts.delete(modularTallyId);
};

export const fetchModularTallyDraft = async (modularTallyId: number) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return null;
  }

  const draft = await dexieDb.modularTallyDrafts.get(modularTallyId);
  return draft ?? null;
};

export const fetchModularTallyDraftIds = async () => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return new Set<number>();
  }

  const modularTallyIds = await dexieDb.modularTallyDrafts
    .toCollection()
    .primaryKeys();
  const modularTallyIdsSet = new Set<number>();

  modularTallyIds.forEach((id) => {
    modularTallyIdsSet.add(id);
  });

  return modularTallyIdsSet;
};
