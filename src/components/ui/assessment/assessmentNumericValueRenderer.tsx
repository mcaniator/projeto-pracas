import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Chip } from "@mui/material";
import AssessmentQuestionIcon from "./assessmentQuestionIcon";

export const AssessmentNumericValueRenderer = ({
  question,
  value,
}: {
  question: AssessmentQuestionItem;
  value: number;
}) => {
  return (
    <div className="inline-flex items-start">
      <AssessmentQuestionIcon question={question} hasValue={value !== 0} />
      <Chip
        label={value}
        size="small"
        color="primary"
        disabled={value === 0}
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
