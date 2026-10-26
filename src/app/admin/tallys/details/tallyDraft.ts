import { dexieDb } from "@/lib/dexie/dexie";
import type { TallySubmitData } from "@/lib/serverFunctions/mutations/tally";
import type {
  ResponseFormGeometry,
  SerializedFormValues,
} from "@/lib/types/formSubmission/responseFormTypes";
import { Capacitor } from "@capacitor/core";

export type TallyDraft = {
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
  personObservations: TallySubmitData["personObservations"];
};

export const saveTallyDraft = async (draft: TallyDraft) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return;
  }

  await dexieDb.tallyDrafts.put(draft);
};

export const deleteTallyDraft = async (tallyId: number) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return;
  }
  await dexieDb.tallyDrafts.delete(tallyId);
};

export const fetchTallyDraft = async (tallyId: number) => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return null;
  }

  const draft = await dexieDb.tallyDrafts.get(tallyId);
  return draft ?? null;
};

export const fetchTallyDraftIds = async () => {
  if (Capacitor.isNativePlatform()) {
    // TODO: implement SQLite draft.
    return new Set<number>();
  }

  const tallyIds = await dexieDb.tallyDrafts
    .toCollection()
    .primaryKeys();
  const tallyIdsSet = new Set<number>();

  tallyIds.forEach((id) => {
    tallyIdsSet.add(id);
  });

  return tallyIdsSet;
};
