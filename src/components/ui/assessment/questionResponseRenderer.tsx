import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { AssessmentBooleanValueRenderer } from "./assessmentBooleanValueRenderer";
import { AssessmentNumericValueRenderer } from "./assessmentNumericValueRenderer";
import { AssessmentPercentageValueRenderer } from "./assessmentPercentageValueRenderer";
import { AssessmentScaleValueRenderer } from "./assessmentScaleValueRenderer";
import { AssessmentTextValueRenderer } from "./assessmentTextValueRenderer";
import { AssessmentUnfilledValueRenderer } from "./assessmentUnfilledValueRenderer";

export type ResolvedQuestionValue =
  | { kind: "none" }
  | { kind: "boolean"; value: boolean }
  | { kind: "text"; values: string[] }
  | { kind: "number"; values: number[] };

const QuestionResponseRenderer = ({
  question,
  resolvedValue,
  isPreview = false,
}: {
  question: AssessmentQuestionItem;
  resolvedValue: ResolvedQuestionValue;
  isPreview?: boolean;
}) => {
  const keyPrefix = isPreview ? "preview" : question.questionId;

  if (resolvedValue.kind === "none") {
    return <AssessmentUnfilledValueRenderer question={question} />;
  }

  if (
    question.characterType === "BOOLEAN" &&
    resolvedValue.kind === "boolean"
  ) {
    return (
      <div className="flex flex-wrap gap-4">
        <AssessmentBooleanValueRenderer
          question={question}
          value={resolvedValue.value}
        />
      </div>
    );
  }

  if (question.characterType === "TEXT" && resolvedValue.kind === "text") {
    return (
      <div className="flex flex-wrap gap-4">
        {resolvedValue.values.map((value, index) => (
          <AssessmentTextValueRenderer
            key={`${keyPrefix}-text-${index}`}
            question={question}
            value={value}
          />
        ))}
      </div>
    );
  }

  if (question.characterType === "NUMBER" && resolvedValue.kind === "number") {
    return (
      <div className="flex flex-wrap gap-4">
        {resolvedValue.values.map((value, index) => (
          <AssessmentNumericValueRenderer
            key={`${keyPrefix}-number-${index}`}
            question={question}
            value={value}
          />
        ))}
      </div>
    );
  }

  if (question.characterType === "SCALE" && resolvedValue.kind === "number") {
    return (
      <>
        {resolvedValue.values.map((value, index) => (
          <AssessmentScaleValueRenderer
            key={`${keyPrefix}-scale-${index}`}
            question={question}
            value={value}
          />
        ))}
      </>
    );
  }

  if (
    question.characterType === "PERCENTAGE" &&
    resolvedValue.kind === "number"
  ) {
    return (
      <>
        {resolvedValue.values.map((value, index) => (
          <AssessmentPercentageValueRenderer
            key={`${keyPrefix}-percentage-${index}`}
            question={question}
            value={value}
          />
        ))}
      </>
    );
  }

  return null;
};

export default QuestionResponseRenderer;
