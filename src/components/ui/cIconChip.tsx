import { IconButton, IconButtonOwnProps, Tooltip } from "@mui/material";
import { ReactNode } from "react";

type IconChipVariant = "disabled" | "default";

type IconChipProps = {
  icon: ReactNode;
  tooltip?: string;
  sx?: IconButtonOwnProps["sx"];
  size?: number;
  variant?: IconChipVariant;
  clickable?: boolean;
  onClick?: () => void;
};

const CIconChip = ({
  icon,
  tooltip,
  sx,
  size = 32,
  variant = "default",
  clickable = false,
  onClick,
}: IconChipProps) => {
  const baseSx: IconButtonOwnProps["sx"] = {
    width: size,
    height: size,
    borderRadius: "50%",
    padding: "4px",
  };

  const variantSx: Record<IconChipVariant, IconButtonOwnProps["sx"]> = {
    disabled: {
      backgroundColor: "#e0e0e0",
      cursor: "default",
      "&:hover": {
        backgroundColor: "primary.main",
        color: "primary.contrastText",
      },
    },
    default: {
      color: "primary.light",
      backgroundColor: "#e0e0e0",
      "&:hover": {
        cursor: clickable ? "pointer" : "default",
        backgroundColor: "primary.dark",
        color: "primary.contrastText",
      },
    },
  };

  const button = (
    <IconButton
      size="small"
      component="span"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      sx={sx ? sx : { ...baseSx, ...variantSx[variant] }}
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
