import type { BehavioralMapDraft } from "@/app/admin/behavioralMaps/details/behavioralMapDraft";
import type { TallyDraft } from "@/app/admin/tallys/details/tallyDraft";
import type { AssessmentDraft } from "@/lib/types/assessments/assessmentDraft";
import { Dexie, type EntityTable } from "dexie";

const dexieDb = new Dexie("PracasLocal") as Dexie & {
  assessments: EntityTable<AssessmentDraft, "id">;
  tallyDrafts: EntityTable<TallyDraft, "id">;
  behavioralMapDrafts: EntityTable<BehavioralMapDraft, "id">;
};

dexieDb.version(1).stores({
  assessments:
    "id, userId, username, savedUpdatedAt, draftUpdatedAt, isFinalized, startDate, endDate, driveFolderUrl, responseFormValues, geometries",
  tallyDrafts:
    "id, userId, username, savedUpdatedAt, draftUpdatedAt, isFinalized, startDate, endDate, responseFormValues, geometries, personObservations",
  behavioralMapDrafts:
    "id, userId, username, savedUpdatedAt, draftUpdatedAt, isFinalized, startDate, endDate, responseFormValues, geometries, observations, groups, observationLinks, responseGeometryLinks",
});

export { dexieDb };
