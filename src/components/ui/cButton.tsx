import { Box, Chip, Tooltip } from "@mui/material";
import Button, { ButtonOwnProps, ButtonProps } from "@mui/material/Button";
import Link from "next/link";
import React, { useState } from "react";

import { useHelperCard } from "../context/helperCardContext";

export type CButtonProps = ButtonProps & {
  dense?: boolean;
  disableMinWidth?: boolean;
  enableTopLeftChip?: boolean;
  topLeftChipLabel?: string | number;
  square?: boolean;
  color?: ButtonOwnProps["color"];
  toDo?: boolean;
  tooltip?: string;
  loadingOnClick?: boolean;
  href?: string;
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
    tooltip,
    loadingOnClick,
    href,
    loading,
    disabled,
    onClick,
    sx,
    ...rest
  } = props;
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = loading ?? (loadingOnClick ? internalLoading : false);
  const minWidthSx =
    disableMinWidth ? { minWidth: "0px" } : { minWidth: "64px" };
  const denseSx = dense ? { padding: "0px 0px", minWidth: "0px" } : {};
  const squareSx = square ? { padding: "6px", minWidth: "0px" } : {};
  const { setHelperCard } = useHelperCard();

  const component = (
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
        loading={isLoading}
        disabled={disabled || isLoading}
        sx={{ ...minWidthSx, ...denseSx, ...squareSx, ...sx }}
        onClick={(e) => {
          if (toDo) {
            setHelperCard({
              show: true,
              helperCardType: "ERROR",
              content: <>Em desenvolvimento</>,
            });
          } else {
            if (loadingOnClick) {
              setInternalLoading(true);
            }
            onClick?.(e);
          }
        }}
        {...rest}
      >
        {children}
      </Button>
    </Box>
  );

  const componentWithLink = href ? <Link href={href}>{component}</Link> : component;

  return tooltip ?
      <Tooltip title={tooltip} enterTouchDelay={1}>
        {componentWithLink}
      </Tooltip>
    : componentWithLink;
}

export default CButton;
