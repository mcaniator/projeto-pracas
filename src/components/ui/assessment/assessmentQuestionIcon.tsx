import CIconChip from "@/components/ui/cIconChip";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";

const AssessmentQuestionIcon = ({
  question,
  hasValue,
}: {
  question: AssessmentQuestionItem;
  hasValue: boolean;
}) => {
  return (
    <CIconChip
      icon={<CDynamicIcon iconKey={question.iconKey} />}
      tooltip={question.name}
      variant={hasValue ? "emphasis" : "disabled"}
    />
  );
};

export default AssessmentQuestionIcon;
