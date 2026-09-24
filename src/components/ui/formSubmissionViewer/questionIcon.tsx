import CIconChip from "@/components/ui/cIconChip";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import { Box, Chip } from "@mui/material";
import { IconMap } from "@tabler/icons-react";

export type QuestionIconGeometryProps = {
  hasGeometries?: boolean;
  onMapChipClick?: () => void;
};

const QuestionIcon = ({
  question,
  hasValue,
  hasGeometries = false,
  onMapChipClick,
}: {
  question: FormSubmissionQuestionItem;
  hasValue: boolean;
} & QuestionIconGeometryProps) => {
  return (
    <div className="inline-flex items-start">
      {hasGeometries && (
        <Chip
          aria-label={`Visualizar geometrias de ${question.name}`}
          label={<IconMap size={12} />}
          size="small"
          color="warning"
          onClick={(event) => {
            event.stopPropagation();
            onMapChipClick?.();
          }}
          sx={{
            marginRight: "-6px",
            marginTop: "-4px",
            height: 20,
            width: 24,
            zIndex: 1,
            "& .MuiChip-labelSmall": { px: "6px" },
          }}
        />
      )}
      <Box sx={{ marginLeft: hasGeometries ? "0px" : "18px" }}>
        <CIconChip
          icon={<CDynamicIcon iconKey={question.iconKey} />}
          tooltip={question.name}
          variant={hasValue ? "emphasis" : "disabled"}
        />
      </Box>
    </div>
  );
};

export default QuestionIcon;
