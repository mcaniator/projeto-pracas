import { FormControlLabel } from "@mui/material";
import Switch, { SwitchProps } from "@mui/material/Switch";
import React from "react";

type CSwtichProps = SwitchProps & {
  label?: string;
};

const CSwitch = React.forwardRef<HTMLButtonElement, CSwtichProps>(
  (props, ref) => {
    const { label, ...rest } = props;

    return (
      <FormControlLabel
        control={<Switch {...rest} ref={ref} />}
        label={label}
      />
    );
  },
);

CSwitch.displayName = "CSwitch";
export default CSwitch;
