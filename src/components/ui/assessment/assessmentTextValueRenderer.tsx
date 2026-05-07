import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import AssessmentQuestionIcon from "./assessmentQuestionIcon";

export const AssessmentTextValueRenderer = ({
  question,
  value,
}: {
  question: AssessmentQuestionItem;
  value: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <AssessmentQuestionIcon question={question} hasValue={value.length > 0} />
      <span className="break-all">{value}</span>
    </div>
  );
};
