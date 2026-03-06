import { Theme } from "@emotion/react";
import { FormControlLabel, SxProps } from "@mui/material";
import Switch, { SwitchProps } from "@mui/material/Switch";
import React from "react";

type CSwtichProps = SwitchProps & {
  label?: string;
  formControlSx?: SxProps<Theme>;
  labelPosition?: "left" | "right";
};

const CSwitch = React.forwardRef<HTMLButtonElement, CSwtichProps>(
  (props, ref) => {
    const { label, formControlSx, labelPosition = "right", ...rest } = props;

    return (
      <FormControlLabel
        sx={formControlSx}
        control={<Switch {...rest} ref={ref} />}
        label={label}
        labelPlacement={labelPosition === "left" ? "start" : "end"}
      />
    );
  },
);

CSwitch.displayName = "CSwitch";
export default CSwitch;
