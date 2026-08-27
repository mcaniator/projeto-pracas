import { type DexieAssessmentDraft, dexieDb } from "@/lib/dexie/dexie";
import { Capacitor } from "@capacitor/core";

export type AssessmentDraft = DexieAssessmentDraft; //Extend if necessary for native app

export const saveAssessmentResponsesDraft = async (draft: AssessmentDraft) => {
  if (Capacitor.isNativePlatform()) return;

  await dexieDb.assessments.put(draft);
};

export const deleteAssessmentResponsesDraft = async (assessmentId: number) => {
  if (Capacitor.isNativePlatform()) return;

  await dexieDb.assessments.delete(assessmentId);
};

export const loadAssessmentResponsesDraft = async (assessmentId: number) => {
  if (Capacitor.isNativePlatform()) return undefined;

  return dexieDb.assessments.get(assessmentId);
};
