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
    const {
      label,
      formControlSx,
      labelPosition = "right",
      readOnly,
      onChange,
      inputProps,
      sx,
      ...rest
    } = props;

    const handleChange: SwitchProps["onChange"] = (event, checked) => {
      if (readOnly) {
        event.preventDefault();
        return;
      }
      onChange?.(event, checked);
    };

    const readOnlySx: SxProps<Theme> =
      readOnly ?
        {
          filter: "saturate(0.0)",
          cursor: "default",
          "& .MuiSwitch-track": {
            backgroundColor: "#666",
            border: "2.5px dashed #000",
            boxSizing: "border-box",
          },
          "& .Mui-checked + .MuiSwitch-track": {
            borderColor: "#000",
          },
          "& .MuiSwitch-switchBase": {
            cursor: "default",
          },
        }
      : {};

    return (
      <FormControlLabel
        sx={formControlSx}
        control={
          <Switch
            {...rest}
            ref={ref}
            onChange={handleChange}
            inputProps={{ ...inputProps, readOnly }}
            disableRipple={readOnly}
            onClick={
              readOnly ?
                (event) => {
                  event.preventDefault();
                }
              : undefined
            }
            sx={{ ...readOnlySx, ...sx }}
          />
        }
        label={label}
        labelPlacement={labelPosition === "left" ? "start" : "end"}
      />
    );
  },
);

CSwitch.displayName = "CSwitch";
export default CSwitch;
