"use client";

import type {
  AssessmentCategoryItem,
  AssessmentQuestionItem,
  AssessmentSubcategoryItem,
} from "@/lib/serverFunctions/queries/assessment";
import type { FormValues } from "@/lib/types/assessments/responseFormTypes";
import { Calculation } from "@/lib/utils/calculationUtils";
import { useEffect, useMemo } from "react";
import {
  type Control,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";

const isAssessmentSubcategoryItem = (
  item: AssessmentQuestionItem | AssessmentSubcategoryItem,
): item is AssessmentSubcategoryItem => "questions" in item;

const CalculationSynchronizer = ({
  categories,
  control,
  setValue,
}: {
  categories: AssessmentCategoryItem[];
  control: Control<FormValues, unknown, FormValues>;
  setValue: UseFormSetValue<FormValues>;
}) => {
  const allValues = useWatch({ control });
  const calculatedQuestions = useMemo(
    () =>
      categories.flatMap((category) =>
        category.categoryChildren.flatMap((child) => {
          if (isAssessmentSubcategoryItem(child)) {
            return child.questions.filter(
              (question) => question.calculationExpression,
            );
          }

          return child.calculationExpression ? [child] : [];
        }),
      ),
    [categories],
  );
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
    calculatedQuestions.forEach((question) => {
      const value = new Calculation(
        question.calculationExpression,
        numericResponses,
      ).evaluate();
      const fieldName = String(question.questionId);

      if (!Object.is(allValues[fieldName], value)) {
        setValue(fieldName, value, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    });
  }, [allValues, calculatedQuestions, numericResponses, setValue]);

  return null;
};

export default CalculationSynchronizer;
