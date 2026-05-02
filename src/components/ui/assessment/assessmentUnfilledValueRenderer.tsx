import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import AssessmentQuestionIcon from "./assessmentQuestionIcon";

export const AssessmentUnfilledValueRenderer = ({
  question,
}: {
  question: AssessmentQuestionItem;
}) => {
  return (
    <div className="flex items-center gap-2">
      <AssessmentQuestionIcon question={question} hasValue={false} />
      <span className="break-all">{"(Não preenchido)"}</span>
    </div>
  );
};
