import { Box, Chip } from "@mui/material";
import Button, { ButtonProps } from "@mui/material/Button";
import React from "react";

type CButtonProps = ButtonProps & {
  dense?: boolean;
  disableMinWidth?: boolean;
  enableTopLeftChip?: boolean;
  topLeftChipLabel?: string | number;
};

function CButton(props: CButtonProps) {
  const {
    children,
    variant = "contained",
    disableMinWidth,
    enableTopLeftChip,
    topLeftChipLabel,
    dense,
    ...rest
  } = props;
  const minWidthSx =
    disableMinWidth ? { minWidth: "0px" } : { minWidth: "64px" };
  const denseSx = dense ? { padding: "0px 0px", minWidth: "0px" } : {};

  return (
    <Box position="relative">
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
        color="primary"
        variant={variant}
        sx={{ ...minWidthSx, ...denseSx, ...props.sx }}
        {...rest}
      >
        {children}
      </Button>
    </Box>
  );
}

export default CButton;
