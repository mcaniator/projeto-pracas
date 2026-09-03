import {
  deleteAdminSQLiteAssessmentDraft,
  fetchAdminSQLiteAssessmentDraft,
  fetchAdminSQLiteAssessmentDraftsIds,
  saveAdminSQLiteAssessmentDraft,
} from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { dexieDb } from "@/lib/dexie/dexie";
import type { AssessmentDraft } from "@/lib/types/assessments/responseFormTypes";
import { Capacitor } from "@capacitor/core";

export const saveAssessmentResponsesDraft = async (draft: AssessmentDraft) => {
  if (Capacitor.isNativePlatform()) {
    await saveAdminSQLiteAssessmentDraft({
      data: {
        assessmentId: draft.id,
        draft: draft,
      },
    });
  } else {
    await dexieDb.assessments.put(draft);
  }
};

export const deleteAssessmentResponsesDraft = async (assessmentId: number) => {
  const assessment = await loadAssessmentResponsesDraft(assessmentId);
  if (!assessment) {
    return;
  }
  if (Capacitor.isNativePlatform()) {
    await deleteAdminSQLiteAssessmentDraft({
      data: {
        assessmentId: assessmentId,
      },
    });
  } else {
    await dexieDb.assessments.delete(assessmentId);
  }
};

export const loadAssessmentResponsesDraft = async (assessmentId: number) => {
  if (Capacitor.isNativePlatform()) {
    const SQLiteDraft = await fetchAdminSQLiteAssessmentDraft({
      params: {
        assessmentId: assessmentId,
      },
    });
    return SQLiteDraft.data;
  }
  const dexieDraft = await dexieDb.assessments.get(assessmentId);
  return dexieDraft ?? null;
};

export const getAssessmentsDraftsIds = async () => {
  if (Capacitor.isNativePlatform()) {
    const fetchResult = await fetchAdminSQLiteAssessmentDraftsIds({});
    const assessmentsIdsSet = new Set<number>();
    fetchResult.data.assessmentIds.forEach((id) => {
      assessmentsIdsSet.add(id);
    });
    return assessmentsIdsSet;
  } else {
    const assessmentsIds = await dexieDb.assessments
      .toCollection()
      .primaryKeys();
    const assessmentsIdsSet = new Set<number>();

    assessmentsIds.forEach((id) => {
      assessmentsIdsSet.add(id);
    });

    return assessmentsIdsSet;
  }
};
