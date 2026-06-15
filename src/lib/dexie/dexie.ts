// db.ts
import {
  ResponseFormGeometry,
  ResponseFormImages,
  SerializedFormValues,
} from "@/components/ui/responseForm/responseFormTypes";
import { Dexie, type EntityTable } from "dexie";

interface DexieAssessment {
  id: number;
  userId: string;
  username: string;
  serverUpdatedAt: Date;
  localUpdatedAt: Date;
  isFinalized: boolean;
  startDate: Date;
  endDate: Date | null;
  driveFolderUrl: string | null;
  responseFormValues: SerializedFormValues;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
}

const dexieDb = new Dexie("PracasLocal") as Dexie & {
  assessments: EntityTable<
    DexieAssessment,
    "id" // primary key "id"
  >;
};

// Schema declaration:
dexieDb.version(1).stores({
  assessments:
    "id, userId, username, serverUpdatedAt, localUpdatedAt, isFinalized, startDate, endDate, driveFolderUrl, responseFormValues, geometries, responseImages",
});

export type { DexieAssessment };
export { dexieDb };
