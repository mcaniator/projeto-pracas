import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";

import QuestionIcon from "./questionIcon";
import type { QuestionIconGeometryProps } from "./questionIcon";

export const TextValueRenderer = ({
  question,
  value,
  hasGeometries,
  onMapChipClick,
}: {
  question: FormSubmissionQuestionItem;
  value: string;
} & QuestionIconGeometryProps) => {
  return (
    <div className="flex items-center gap-2">
      <QuestionIcon
        question={question}
        hasValue={value.length > 0}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />
      <span className="break-words">{value}</span>
    </div>
  );
};
