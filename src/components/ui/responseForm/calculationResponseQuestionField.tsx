"use client";

import CNumberField from "@/components/ui/cNumberField";
import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import type { FormValues } from "@/lib/types/formSubmission/responseFormTypes";
import { type Control, useController } from "react-hook-form";

const CalculationResponseQuestionField = ({
  question,
  control,
}: {
  question: FormSubmissionQuestionItem;
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
