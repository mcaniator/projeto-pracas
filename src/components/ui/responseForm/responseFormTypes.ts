import type { ResponseGeometry } from "@/lib/types/assessments/geometry";
import { Dayjs } from "dayjs";

export type ResponseFormGeometry = {
  questionId: number;
  geometries: ResponseGeometry[];
};

export type SimpleMention = {
  id: string;
  display: string;
};

export type ResponseQuestionValue =
  | string
  | number
  | number[]
  | boolean
  | Dayjs
  | null;

export type SerializedResponseQuestionValue = Exclude<
  ResponseQuestionValue,
  Dayjs
>;
// Each key is a question id. react-hook-form expects the key to be a string
export type FormValues = {
  [key: string]: ResponseQuestionValue;
};
// Each key is a question id. Serialized values are not use with react-hook-form, but we mantain the same structure
export type SerializedFormValues = {
  [key: string]: SerializedResponseQuestionValue;
};
