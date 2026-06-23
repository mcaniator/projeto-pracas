import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";

import AssessmentQuestionIcon from "./assessmentQuestionIcon";
import type { AssessmentQuestionIconGeometryProps } from "./assessmentQuestionIcon";

export const AssessmentUnfilledValueRenderer = ({
  question,
  hasGeometries,
  onMapChipClick,
}: {
  question: AssessmentQuestionItem;
} & AssessmentQuestionIconGeometryProps) => {
  return (
    <div className="flex items-center gap-2">
      <AssessmentQuestionIcon
        question={question}
        hasValue={false}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />
      <span className="break-all">{"(Não preenchido)"}</span>
    </div>
  );
};
