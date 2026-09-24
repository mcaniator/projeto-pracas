import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import { Chip } from "@mui/material";

import QuestionIcon from "./questionIcon";
import type { QuestionIconGeometryProps } from "./questionIcon";

export const NumericValueRenderer = ({
  question,
  value,
  hasGeometries,
  onMapChipClick,
}: {
  question: FormSubmissionQuestionItem;
  value: number;
} & QuestionIconGeometryProps) => {
  return (
    <div className="inline-flex items-start">
      <QuestionIcon
        question={question}
        hasValue={value !== 0}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />
      <Chip
        label={value}
        size="small"
        color="primary"
        sx={{
          marginLeft: "-6px",
          marginTop: "-4px",
          height: 20,
          fontSize: "0.7rem",
          width: "max-content",
          maxWidth: "none",
          flexShrink: 0,
          zIndex: 1,
          "& .MuiChip-label": {
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "nowrap",
          },
        }}
      />
    </div>
  );
};
