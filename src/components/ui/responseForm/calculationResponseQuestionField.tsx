"use client";

import CNumberField from "@/components/ui/cNumberField";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Calculation } from "@/lib/utils/calculationUtils";
import { useEffect, useMemo } from "react";
import {
  type Control,
  type UseFormSetValue,
  useController,
} from "react-hook-form";

import type { FormValues } from "./responseFormTypes";

const CalculationResponseQuestionField = ({
  question,
  numericResponses,
  control,
  setValue,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  control: Control<FormValues, unknown, FormValues>;
  setValue: UseFormSetValue<FormValues>;
}) => {
  const fieldName = String(question.questionId);
  const { field } = useController({
    name: fieldName,
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
    if (!Object.is(field.value, value)) {
      // If the value has changed, update the form without triggering validation
      setValue(fieldName, value, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [field.value, fieldName, setValue, value]);

  return <CNumberField {...field} readOnly value={value} />;
};

export default CalculationResponseQuestionField;
