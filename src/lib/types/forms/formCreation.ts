import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";

type OptionForQuestionPicker = {
  id: number;
  text: string;
  isOverridable: boolean;
};

type QuestionForQuestionPicker = {
  id: number;
  name: string;
  iconKey: string;
  isPublic: boolean;
  questionType: QuestionTypes;
  notes: string | null;
  characterType: QuestionResponseCharacterTypes;
  optionType: OptionTypes | null;
  options: OptionForQuestionPicker[];
  scaleConfig: {
    minValue: number;
    maxValue: number;
  } | null;
  geometryTypes: QuestionGeometryTypes[];
};

type SubCategoryForQuestionPicker = {
  id: number;
  name: string;
  notes: string | null;
  question: QuestionForQuestionPicker[];
};

type CategoryForQuestionPicker = {
  id: number;
  name: string;
  notes: string | null;
  question: QuestionForQuestionPicker[];
  subcategory: SubCategoryForQuestionPicker[];
};

type QuestionPickerQuestionToAdd = QuestionForQuestionPicker & {
  categoryId: number;
  subcategoryId: number | null;
};

type QuestionPickerQuestionToEdit = QuestionPickerQuestionToAdd & {
  categoryName: string;
  subcategoryName: string | null;
};

export {
  type OptionForQuestionPicker,
  type CategoryForQuestionPicker,
  type SubCategoryForQuestionPicker,
  type QuestionForQuestionPicker,
  type QuestionPickerQuestionToAdd,
  type QuestionPickerQuestionToEdit,
};
