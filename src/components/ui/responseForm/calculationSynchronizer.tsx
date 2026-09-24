"use client";

import type { GetFormSubmissionDataResult } from "@/lib/serverFunctions/queries/formSubmission";
import type { FormValues } from "@/lib/types/formSubmission/responseFormTypes";
import { Calculation } from "@/lib/utils/calculationUtils";
import { useEffect, useMemo } from "react";
import { type Control, type UseFormSetValue, useWatch } from "react-hook-form";

const CalculationSynchronizer = ({
  calculations,
  control,
  setValue,
}: {
  calculations: GetFormSubmissionDataResult["calculations"];
  control: Control<FormValues, unknown, FormValues>;
  setValue: UseFormSetValue<FormValues>;
}) => {
  const allValues = useWatch({ control });
  const numericResponses = useMemo(() => {
    const responses = new Map<number, number>();

    Object.entries(allValues).forEach(([questionId, value]) => {
      if (typeof value === "number") {
        responses.set(Number(questionId), value);
      }
    });

    return responses;
  }, [allValues]);

  useEffect(() => {
    calculations.forEach((calculation) => {
      const value = new Calculation(
        calculation.expression,
        numericResponses,
      ).evaluate();
      const fieldName = String(calculation.targetQuestionId);

      if (!Object.is(allValues[fieldName], value)) {
        setValue(fieldName, value, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    });
  }, [allValues, calculations, numericResponses, setValue]);

  return null;
};

export default CalculationSynchronizer;
