import type {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";
import type { OptionForQuestionPicker } from "@customTypes/forms/formCreation";

export type ScaleOptionMode = "MANUAL" | "STEP";

export type QuestionCreationDraft = {
  name: string;
  notes: string | null;
  iconKey: string;
  isPublic: boolean;
  questionType: QuestionTypes;
  characterType: QuestionResponseCharacterTypes;
  optionType: OptionTypes | null;
  options: Omit<OptionForQuestionPicker, "id">[];
  hasAssociatedGeometry: boolean;
  geometryTypes: QuestionGeometryTypes[];
  scaleConfig: { minValue: number; maxValue: number } | null;
};
