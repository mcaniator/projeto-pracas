import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";

import QuestionIcon from "./questionIcon";
import type { QuestionIconGeometryProps } from "./questionIcon";

export const UnfilledValueRenderer = ({
  question,
  hasGeometries,
  onMapChipClick,
}: {
  question: FormSubmissionQuestionItem;
} & QuestionIconGeometryProps) => {
  return (
    <div className="flex items-center gap-2">
      <QuestionIcon
        question={question}
        hasValue={false}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />
      <span className="break-all">{"(Não preenchido)"}</span>
    </div>
  );
};
