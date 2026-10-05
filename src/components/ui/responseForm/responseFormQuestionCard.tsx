import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import type { SimpleMention } from "@/lib/types/formSubmission/responseFormTypes";
import { Box } from "@mui/material";
import type { ReactNode } from "react";

import ResponseFormQuestionDescriptors from "./responseFormQuestionDescriptors";

const ResponseFormQuestionCard = ({
  question,
  calculationExpression,
  questionsForMention,
  questionControls,
  children,
}: {
  question: FormSubmissionQuestionItem;
  calculationExpression?: string;
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
        calculationExpression={calculationExpression}
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
