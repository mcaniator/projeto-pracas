import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";

import AssessmentQuestionIcon from "./assessmentQuestionIcon";
import type { AssessmentQuestionIconGeometryProps } from "./assessmentQuestionIcon";

export const AssessmentTextValueRenderer = ({
  question,
  value,
  hasGeometries,
  onMapChipClick,
}: {
  question: AssessmentQuestionItem;
  value: string;
} & AssessmentQuestionIconGeometryProps) => {
  return (
    <div className="flex items-center gap-2">
      <AssessmentQuestionIcon
        question={question}
        hasValue={value.length > 0}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />
      <span className="break-all">{value}</span>
    </div>
  );
};
