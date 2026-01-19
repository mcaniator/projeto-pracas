import {
  OptionTypes,
  QuestionGeometryTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";

type FormQuestionWithCategoryAndSubcategory = {
  id: number;
  name: string;
  notes: string | null;
  questionType: QuestionTypes;
  characterType: QuestionResponseCharacterTypes;
  optionType: OptionTypes | null;
  options: {
    text: string;
  }[];
  geometryTypes: [QuestionGeometryTypes];
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
    categoryId: number;
  } | null;
};

type QuestionForQuestionPicker = {
  id: number;
  name: string;
  questionType: QuestionTypes;
  notes: string | null;
  characterType: QuestionResponseCharacterTypes;
  optionType: OptionTypes | null;
  options: {
    text: string;
  }[];
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
export {
  type FormQuestionWithCategoryAndSubcategory,
  type CategoryForQuestionPicker,
  type SubCategoryForQuestionPicker,
  type QuestionForQuestionPicker,
  type QuestionPickerQuestionToAdd,
};
