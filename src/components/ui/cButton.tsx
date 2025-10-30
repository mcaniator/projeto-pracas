import { Box, Chip } from "@mui/material";
import Button, { ButtonOwnProps, ButtonProps } from "@mui/material/Button";
import React, { InputHTMLAttributes, useRef } from "react";

type CButtonProps = ButtonProps & {
  dense?: boolean;
  disableMinWidth?: boolean;
  enableTopLeftChip?: boolean;
  topLeftChipLabel?: string | number;
  square?: boolean;
  color?: ButtonOwnProps["color"];
  filePicker?: boolean;
  fileAccept?: InputHTMLAttributes<HTMLInputElement>["accept"];
  onFileInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    filePicker,
    fileAccept,
    onClick,
    onFileInput,
    sx,
    ...rest
  } = props;
  const minWidthSx =
    disableMinWidth ? { minWidth: "0px" } : { minWidth: "64px" };
  const denseSx = dense ? { padding: "0px 0px", minWidth: "0px" } : {};
  const squareSx = square ? { padding: "6px", minWidth: "0px" } : {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (filePicker) {
      fileInputRef.current?.click();
    }
  };
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
        onClick={handleClick}
        {...rest}
      >
        {children}
      </Button>
      {filePicker && (
        <input
          type="file"
          accept={fileAccept}
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileInput}
        />
      )}
    </Box>
  );
}

export default CButton;
