"use client";

import CNumberField from "@/components/ui/cNumberField";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import type { FormValues } from "@/lib/types/assessments/responseFormTypes";
import { type Control, useController } from "react-hook-form";

const CalculationResponseQuestionField = ({
  question,
  control,
}: {
  question: AssessmentQuestionItem;
  control: Control<FormValues, unknown, FormValues>;
}) => {
  const fieldName = String(question.questionId);
  const { field } = useController({
    name: fieldName,
    control,
  });

  return (
    <CNumberField
      {...field}
      readOnly
      value={typeof field.value === "number" ? field.value : null}
    />
  );
};

export default CalculationResponseQuestionField;
