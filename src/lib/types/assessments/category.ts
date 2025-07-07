import { Question } from "@prisma/client";

import { ResponseCalculation } from "./calculation";

type SubcategoryWithQuestionAndCalculation = {
  id: number;
  name: string;
  questions: Question[];
  calculations: ResponseCalculation[];
};

type CategoryWithSubcategoryAndQuestionAndCalculation = {
  id: number;
  name: string;
  subcategories: SubcategoryWithQuestionAndCalculation[];
  questions: Question[];
  calculations: ResponseCalculation[];
};

export {
  type SubcategoryWithQuestionAndCalculation,
  type CategoryWithSubcategoryAndQuestionAndCalculation,
};
