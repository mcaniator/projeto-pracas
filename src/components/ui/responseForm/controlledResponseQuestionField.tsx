import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Controller, type Control } from "react-hook-form";
import CalculationResponseQuestionField from "./calculationResponseQuestionField";
import ResponseQuestionFieldRenderer from "./responseQuestionFieldRenderer";
import type { FormValues, ResponseQuestionValue } from "./responseFormTypes";

const ControlledResponseQuestionField = ({
  question,
  numericResponses,
  control,
  finalized,
}: {
  question: AssessmentQuestionItem;
  numericResponses: Map<number, number>;
  control: Control<FormValues, unknown, FormValues>;
  finalized: boolean;
}) => {
  if (question.calculationExpression) {
    return (
      <CalculationResponseQuestionField
        question={question}
        numericResponses={numericResponses}
        control={control}
      />
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
          value={(field.value ?? null) as ResponseQuestionValue}
          onChange={field.onChange}
        />
      )}
    />
  );
};

export default ControlledResponseQuestionField;
