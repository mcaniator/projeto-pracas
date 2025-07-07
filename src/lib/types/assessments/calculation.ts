import { CalculationTypes, Question } from "@prisma/client";

type ResponseCalculation = {
  id: number;
  name: string;
  type: CalculationTypes;
  questions: Question[];
};

export { type ResponseCalculation };
