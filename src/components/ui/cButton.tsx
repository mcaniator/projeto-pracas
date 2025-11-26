import { Box, Chip } from "@mui/material";
import Button, { ButtonOwnProps, ButtonProps } from "@mui/material/Button";
import React from "react";

import { useHelperCard } from "../context/helperCardContext";

export type CButtonProps = ButtonProps & {
  dense?: boolean;
  disableMinWidth?: boolean;
  enableTopLeftChip?: boolean;
  topLeftChipLabel?: string | number;
  square?: boolean;
  color?: ButtonOwnProps["color"];
  toDo?: boolean;
};

function CButton(props: CButtonProps) {
  const {
    children,
    variant = "contained",
    disableMinWidth,
    enableTopLeftChip,
    topLeftChipLabel,
    className,
    dense,
    square,
    color,
    toDo,
    onClick,
    sx,
    ...rest
  } = props;
  const minWidthSx =
    disableMinWidth ? { minWidth: "0px" } : { minWidth: "64px" };
  const denseSx = dense ? { padding: "0px 0px", minWidth: "0px" } : {};
  const squareSx = square ? { padding: "6px", minWidth: "0px" } : {};
  const { setHelperCard } = useHelperCard();

  return (
    <Box
      position="relative"
      className={className}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {enableTopLeftChip && topLeftChipLabel != null && (
        <Chip
          label={topLeftChipLabel}
          size="small"
          color="error"
          sx={{
            position: "absolute",
            top: -8,
            left: -8,
            zIndex: 1,
            fontSize: "0.7rem",
          }}
        />
      )}

      <Button
        color={color ?? "primary"}
        variant={variant}
        sx={{ ...minWidthSx, ...denseSx, ...squareSx, ...sx }}
        onClick={(e) => {
          if (toDo) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>Em desenvolvimento</>,
            });
          } else {
            onClick?.(e);
          }
        }}
        {...rest}
      >
        {children}
      </Button>
    </Box>
  );
}

export default CButton;
