import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import ResponseFormQuestionDescriptors from "./responseFormQuestionDescriptors";
import type { SimpleMention } from "./responseFormTypes";

const ResponseFormQuestionCard = ({
  question,
  questionsForMention,
  geometryControls,
  children,
}: {
  question: AssessmentQuestionItem;
  questionsForMention: SimpleMention[];
  geometryControls?: ReactNode;
  children: ReactNode;
}) => {
  return (
    <Box
      sx={{ border: 1, borderColor: "primary.main", borderRadius: 1 }}
      className="flex flex-col justify-between gap-1 px-4 py-2"
    >
      <ResponseFormQuestionDescriptors
        question={question}
        questionsForMention={questionsForMention}
      />
      <div className="flex items-center gap-2 break-all">
        <CDynamicIcon iconKey={question.iconKey} />
        {question.name}
      </div>
      <div className="mb-1 flex flex-wrap justify-start gap-1">
        {geometryControls}
      </div>
      {children}
    </Box>
  );
};

export default ResponseFormQuestionCard;
