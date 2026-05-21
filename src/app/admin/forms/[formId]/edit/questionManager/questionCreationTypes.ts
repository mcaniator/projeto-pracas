import type {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";

export type ScaleOptionMode = "MANUAL" | "STEP";

export type QuestionCreationDraft = {
  name: string;
  notes: string | null;
  iconKey: string;
  isPublic: boolean;
  questionType: QuestionTypes;
  characterType: QuestionResponseCharacterTypes;
  optionType: OptionTypes | null;
  options: { text: string }[];
  hasAssociatedGeometry: boolean;
  geometryTypes: QuestionGeometryTypes[];
  scaleConfig: { minValue: number; maxValue: number } | null;
};
