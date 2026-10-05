import QuestionIcon, {
  type QuestionIconGeometryProps,
} from "@/components/ui/formSubmissionViewer/questionIcon";
import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import { Chip } from "@mui/material";
import { IconCheck, IconX } from "@tabler/icons-react";

export const BooleanValueRenderer = ({
  question,
  value,
  hasGeometries,
  onMapChipClick,
}: {
  question: FormSubmissionQuestionItem;
  value: boolean;
} & QuestionIconGeometryProps) => {
  return (
    <div className="inline-flex items-start">
      <QuestionIcon
        question={question}
        hasValue={value}
        hasGeometries={hasGeometries}
        onMapChipClick={onMapChipClick}
      />
      <Chip
        label={value ? <IconCheck size={10} /> : <IconX size={10} />}
        size="small"
        color={value ? "primary" : "error"}
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
          "& .MuiChip-labelSmall": {
            px: "6px",
          },
        }}
      />
    </div>
  );
};
