"use client";

import CNumberField from "@/components/ui/cNumberField";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Calculation } from "@/lib/utils/calculationUtils";
import { useEffect, useMemo } from "react";
import { type Control, useController } from "react-hook-form";

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
  const { field } = useController({
    name: String(question.questionId),
    control,
  });

  const value = useMemo(() => {
    const calc = new Calculation(
      question.calculationExpression,
      numericResponses,
    );
    return calc.evaluate();
  }, [numericResponses, question.calculationExpression]);

  useEffect(() => {
    if (field.value !== value) {
      field.onChange(value);
    }
  }, [field, value]);

  return <CNumberField {...field} readOnly value={value} />;
};

export default CalculationResponseQuestionField;
