import type { ResponseGeometry } from "@/lib/types/assessments/geometry";

export type FormValues = {
  [key: string]: string | number | number[] | boolean | null;
};

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
  | null;
