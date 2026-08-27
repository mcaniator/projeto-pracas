import type { AssessmentDraft } from "@/lib/types/assessments/responseFormTypes";
import type { WeatherStats } from "@/lib/types/tallys/ongoingTally";
import type { CommercialActivity } from "@/lib/zodValidators";
import { Dexie, type EntityTable } from "dexie";

interface DexieTally {
  id: number;
  userId: string;
  username: string;
  serverUpdatedAt: Date;
  localUpdatedAt: Date;
  isFinalized: boolean;
  startDate: Date;
  endDate: Date | null;
  weatherStats: WeatherStats;
  tallyMap: Record<string, number>;
  commercialActivities: CommercialActivity;
  complementaryData: {
    animalsAmount: number;
    groupsAmount: number;
  };
}

const dexieDb = new Dexie("PracasLocal") as Dexie & {
  assessments: EntityTable<
    AssessmentDraft,
    "id" // primary key "id"
  >;
  tallys: EntityTable<
    DexieTally,
    "id" // primary key "id"
  >;
};

// Schema declaration:
dexieDb.version(1).stores({
  assessments:
    "id, userId, username, serverUpdatedAt, localUpdatedAt, isFinalized, startDate, endDate, driveFolderUrl, responseFormValues, geometries",
  tallys:
    "id, userId, username, serverUpdatedAt, localUpdatedAt, isFinalized, startDate, endDate, weatherStats, tallyMap, commercialActivities, complementaryData",
});

export type { DexieTally };
export { dexieDb };
