import CIconChip from "@/components/ui/cIconChip";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { Box, Chip } from "@mui/material";
import { IconMap } from "@tabler/icons-react";

export type AssessmentQuestionIconGeometryProps = {
  hasGeometries?: boolean;
  onMapChipClick?: () => void;
};

const AssessmentQuestionIcon = ({
  question,
  hasValue,
  hasGeometries = false,
  onMapChipClick,
}: {
  question: AssessmentQuestionItem;
  hasValue: boolean;
} & AssessmentQuestionIconGeometryProps) => {
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

export default AssessmentQuestionIcon;
