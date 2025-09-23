import Button, { ButtonProps } from "@mui/material/Button";
import React from "react";

type CButtonProps = ButtonProps & {
  dense?: boolean;
  disableMinWidth?: boolean;
};

function CButton(props: CButtonProps) {
  const {
    children,
    variant = "contained",
    disableMinWidth,
    dense,
    ...rest
  } = props;
  const minWidthSx =
    disableMinWidth ? { minWidth: "0px" } : { minWidth: "64px" };
  const denseSx = dense ? { padding: "0px 0px", minWidth: "0px" } : {};

  return (
    <Button
      color="primary"
      variant={variant}
      sx={{ ...minWidthSx, ...denseSx, ...props.sx }}
      {...rest}
    >
      {children}
    </Button>
  );
}

export default CButton;
