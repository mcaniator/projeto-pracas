// db.ts
import {
  ResponseFormGeometry,
  ResponseFormImages,
  SerializedFormValues,
} from "@/components/ui/responseForm/responseFormTypes";
import { Dexie, type EntityTable } from "dexie";

interface DexieAssessment {
  id: number;
  serverUpdatedAt: Date;
  localUpdatedAt: Date;
  responseFormValues: SerializedFormValues;
  geometries: ResponseFormGeometry[];
  responseImages: ResponseFormImages;
  userId: string;
  username: string;
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
    "id, serverUpdatedAt, localUpdatedAt, responseFormValues, geometries, responseImages, userId, username",
});

export type { DexieAssessment };
export { dexieDb };
