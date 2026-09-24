import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import type { FormValues } from "@/lib/types/formSubmission/responseFormTypes";
import { type Control, Controller } from "react-hook-form";

import CalculationResponseQuestionField from "./calculationResponseQuestionField";
import ResponseQuestionFieldRenderer from "./responseQuestionFieldRenderer";

const ControlledResponseQuestionField = ({
  question,
  calculationExpression,
  control,
  finalized,
}: {
  question: FormSubmissionQuestionItem;
  calculationExpression?: string;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  if (calculationExpression) {
    return (
      <CalculationResponseQuestionField question={question} control={control} />
    );
  }

  return (
    <Controller
      name={String(question.questionId)}
      control={control}
      render={({ field }) => (
        <ResponseQuestionFieldRenderer
          question={question}
          readOnly={finalized}
          value={field.value ?? null}
          onChange={field.onChange}
        />
      )}
    />
  );
};

export default ControlledResponseQuestionField;
