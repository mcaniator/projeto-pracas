import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

import ResponseFormQuestionDescriptors from "./responseFormQuestionDescriptors";
import type { SimpleMention } from "./responseFormTypes";

const ResponseFormQuestionCard = ({
  question,
  questionsForMention,
  questionControls,
  children,
}: {
  question: AssessmentQuestionItem;
  questionsForMention: SimpleMention[];
  questionControls?: ReactNode;
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
      {children}
      <div className="mt-1 flex flex-wrap items-start justify-start gap-2">
        {questionControls}
      </div>
    </Box>
  );
};

export default ResponseFormQuestionCard;
