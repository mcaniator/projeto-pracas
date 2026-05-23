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

export type FormValues = {
  [key: string]: ResponseQuestionValue;
};

export type SerializedFormValues = {
  [key: string]: SerializedResponseQuestionValue;
};
