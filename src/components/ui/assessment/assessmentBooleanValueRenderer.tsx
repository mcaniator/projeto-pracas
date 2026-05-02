import CIconChip from "@/components/ui/cIconChip";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";

export const AssessmentBooleanValueRenderer = ({
  question,
  value,
}: {
  question: AssessmentQuestionItem;
  value: boolean;
}) => {
  return (
    <CIconChip
      icon={<CDynamicIcon iconKey={question.iconKey} />}
      tooltip={question.name}
      variant={value ? "emphasis" : "disabled"}
    />
  );
};
