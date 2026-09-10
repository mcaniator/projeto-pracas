import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import type { FormValues } from "@/lib/types/assessments/responseFormTypes";
import { type Control, Controller } from "react-hook-form";

import CalculationResponseQuestionField from "./calculationResponseQuestionField";
import ResponseQuestionFieldRenderer from "./responseQuestionFieldRenderer";

const ControlledResponseQuestionField = ({
  question,
  control,
  finalized,
}: {
  question: AssessmentQuestionItem;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  if (question.calculationExpression) {
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
