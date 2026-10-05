import type { OptionForQuestionPicker } from "@/lib/types/forms/formCreation";
import type {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";

export type CalculationParams = {
  targetQuestionId: number;
  questionName: string;
  expression: string;
  expressionQuestionsIds: number[];
};

export type SubcategoryItem = {
  position: number;
  subcategoryId: number;
  name: string;
  notes: string | null;
  questions: QuestionItem[];
};

export type QuestionItem = {
  position: number;
  questionId: number;
  name: string;
  iconKey: string;
  isPublic: boolean;
  notes: string | null;
  questionType: QuestionTypes;
  characterType: QuestionResponseCharacterTypes;
  optionType?: OptionTypes | null;
  categoryName: string;
  subcategoryName: string | null;
  options?: OptionForQuestionPicker[];
  minValue: number | null;
  maxValue: number | null;
  allowResponseImages: boolean;
  geometryTypes: QuestionGeometryTypes[];
};

export type CategoryItem = {
  categoryId: number;
  name: string;
  notes: string | null;
  position: number;
  categoryChildren: (QuestionItem | SubcategoryItem)[];
};

export type FormStructure = {
  formId: number;
  formName: string;
  formIsFinalized: boolean;
  categories: CategoryItem[];
  calculations?: CalculationParams[];
};
