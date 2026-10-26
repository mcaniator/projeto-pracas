import type { ModularTallyDraft } from "@/app/admin/modularTally/details/modularTallyDraft";
import type { AssessmentDraft } from "@/lib/types/assessments/assessmentDraft";
import { Dexie, type EntityTable } from "dexie";

const dexieDb = new Dexie("PracasLocal") as Dexie & {
  assessments: EntityTable<
    AssessmentDraft,
    "id" // primary key "id"
  >;
  modularTallyDrafts: EntityTable<
    ModularTallyDraft,
    "id" // primary key "id"
  >;
};

// Schema declaration:
dexieDb.version(2).stores({
  assessments:
    "id, userId, username, savedUpdatedAt, draftUpdatedAt, isFinalized, startDate, endDate, driveFolderUrl, responseFormValues, geometries",
  modularTallyDrafts:
    "id, userId, username, savedUpdatedAt, draftUpdatedAt, isFinalized, startDate, endDate, responseFormValues, geometries, personObservations",
});

export { dexieDb };
