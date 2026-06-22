import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import type { AssessmentOptionValueWithOverride } from "@/lib/types/overridableOptionsComponents";
import { Dayjs } from "dayjs";

export type ResponseFormGeometry = {
  questionId: number;
  geometries: ResponseGeometry[];
};

export type ResponseFormImageSyncStatus = "SYNCED" | "UNSYNCED";

export type ResponseFormImage = {
  file?: File;
  url?: string;
  status: ResponseFormImageSyncStatus;
};

export type ResponseFormImages = Record<number, ResponseFormImage[]>;

export type SimpleMention = {
  id: string;
  display: string;
};

export type ResponseQuestionValue =
  | string
  | number
  | AssessmentOptionValueWithOverride
  | AssessmentOptionValueWithOverride[]
  | boolean
  | Dayjs
  | null;

export type SerializedOptionValueWithOverride = {
  value: number;
  override: string | null;
};

export type SerializedResponseQuestionValue =
  | string
  | number
  | AssessmentOptionValueWithOverride
  | SerializedOptionValueWithOverride[]
  | boolean
  | null;
// Each key is a question id. react-hook-form expects the key to be a string
export type FormValues = {
  [key: string]: ResponseQuestionValue;
};
// Each key is a question id. Serialized values are not use with react-hook-form, but we mantain the same structure
export type SerializedFormValues = {
  [key: string]: SerializedResponseQuestionValue;
};

export function isAssessmentOptionValueWithOverride(
  rawValue: ResponseQuestionValue | undefined,
): rawValue is AssessmentOptionValueWithOverride {
  return (
    rawValue !== undefined &&
    rawValue !== null &&
    typeof rawValue === "object" &&
    "value" in rawValue &&
    "override" in rawValue
  );
}

export function isAssessmentOptionValueWithOverrideArray(
  value: unknown,
): value is AssessmentOptionValueWithOverride[] {
  return (
    Array.isArray(value) && value.every(isAssessmentOptionValueWithOverride)
  );
}
