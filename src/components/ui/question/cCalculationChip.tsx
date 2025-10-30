import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps, Tooltip } from "@mui/material";
import { IconCalculator } from "@tabler/icons-react";
import { useState } from "react";

import CMentionsTextField from "../cMentionsTextField";
import CDialog from "../dialog/cDialog";

type CalculationChipProps = {
  name?: string;
  expression?: string | null;
  sx?: IconButtonOwnProps["sx"];
  questions: { id: string; display: string }[];
};

const CCalculationChip = ({
  expression,
  name,
  sx,
  questions,
}: CalculationChipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltip = "Questão preenchida por cáculo";
  const icon = <IconCalculator />;
  const variant = "default";

  const handleChipClick = () => {
    if (!expression) return;
    setIsOpen((prev) => !prev);
  };

  if (!expression) {
    return;
  }

  return (
    <>
      <CIconChip
        icon={icon}
        tooltip={tooltip}
        onClick={handleChipClick}
        sx={sx}
        variant={variant}
        clickable={!!expression}
      />
      <CDialog
        title="Cálculo"
        fullWidth
        subtitle={name}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        disableDialogActions
      >
        <div className="mt-1 w-full">
          <Tooltip title={expression} enterTouchDelay={1}>
            <CMentionsTextField
              fullWidth
              label="Expressão"
              highlightColor="primary.main"
              size="small"
              highlightTextColor
              value={expression}
              dataSources={[{ data: questions }]}
              readOnly
            />
          </Tooltip>
        </div>
      </CDialog>
    </>
  );
};

export default CCalculationChip;
