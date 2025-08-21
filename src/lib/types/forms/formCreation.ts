import {
  CalculationTypes,
  OptionTypes,
  QuestionResponseCharacterTypes,
  QuestionTypes,
} from "@prisma/client";

type FormQuestionWithCategoryAndSubcategory = {
  id: number;
  name: string;
  notes: string | null;
  type: QuestionTypes;
  characterType: QuestionResponseCharacterTypes;
  optionType: OptionTypes | null;
  options: {
    text: string;
  }[];
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

type FormCalculation = {
  id: number;
  name: string;
  type: CalculationTypes;
  questions: {
    id: number;
    name: string;
  }[];
  category: {
    id: number;
    name: string;
  };
  subcategory: {
    id: number;
    name: string;
  } | null;
};

export { type FormQuestionWithCategoryAndSubcategory, type FormCalculation };
