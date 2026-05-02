"use client";

import CNumberField from "@/components/ui/cNumberField";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Calculation } from "@/lib/utils/calculationUtils";
import { useEffect, useState } from "react";
import { Controller, type Control } from "react-hook-form";
import type { FormValues } from "./responseFormTypes";

const CalculationResponseQuestionField = ({
  question,
  numericResponses,
  control,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const calc = new Calculation(
      question.calculationExpression!,
      numericResponses,
    );
    setValue(calc.evaluate());
  }, [numericResponses, question.calculationExpression]);

  return (
    <Controller
      name={String(question.questionId)}
      control={control}
      render={({ field }) => <CNumberField {...field} readOnly value={value} />}
    />
  );
};

export default CalculationResponseQuestionField;
