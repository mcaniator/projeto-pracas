import Switch, { SwitchProps } from "@mui/material/Switch";
import React from "react";

type CSwtichProps = SwitchProps & {
  label?: string;
};

const CSwitch = React.forwardRef<HTMLButtonElement, CSwtichProps>(
  (props, ref) => {
    const { label, ...rest } = props;

    return (
      <div className="flex items-center">
        <Switch ref={ref} {...rest} />
        {label && <span className="ml-1">{label}</span>}
      </div>
    );
  },
);

CSwitch.displayName = "CSwitch";
export default CSwitch;
