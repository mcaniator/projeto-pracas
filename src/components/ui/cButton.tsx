import Button, { ButtonProps } from "@mui/material/Button";
import React from "react";

type CButtonProps = ButtonProps;

function CButton(props: CButtonProps) {
  const { children, variant = "contained", ...rest } = props;

  return (
    <Button color="primary" variant={variant} {...rest}>
      {children}
    </Button>
  );
}

export default CButton;
