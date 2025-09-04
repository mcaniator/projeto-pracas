import { IconButton, IconButtonOwnProps, Tooltip } from "@mui/material";
import { ReactNode } from "react";

type IconChipProps = {
  icon: ReactNode;
  tooltip?: string;
  sx?: IconButtonOwnProps["sx"];
  size?: number;
  onClick?: () => void;
};

const CIconChip = ({
  icon,
  tooltip,
  sx,
  size = 32,
  onClick,
}: IconChipProps) => {
  const defaultSx: IconButtonOwnProps["sx"] = {
    width: size,
    height: size,
    borderRadius: "50%",
    padding: "4px",
    backgroundColor: "#e0e0e0",
    cursor: "default",
    "&:hover": {
      backgroundColor: "#d5d5d5",
    },
  };

  const button = (
    <IconButton
      size="small"
      onClick={onClick}
      sx={sx ? { ...defaultSx, ...sx } : defaultSx}
    >
      {icon}
    </IconButton>
  );

  return tooltip ?
      <Tooltip title={tooltip} enterTouchDelay={1}>
        {button}
      </Tooltip>
    : button;
};

export default CIconChip;
