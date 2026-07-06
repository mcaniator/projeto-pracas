import { Theme } from "@emotion/react";
import {
  FormControlLabel,
  SxProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import Switch, { SwitchProps } from "@mui/material/Switch";
import React from "react";

type CSwtichProps = SwitchProps & {
  label?: string;
  formControlSx?: SxProps<Theme>;
  labelPosition?: "left" | "right";
  tooltip?: string;
  tooltipProps?: TooltipProps;
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
      tooltip,
      tooltipProps,
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

    const resolvedTooltipProps = {
      title: tooltip,
      ...tooltipProps,
    };

    const component = (
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

    if (!tooltip) {
      return component;
    }

    return <Tooltip {...resolvedTooltipProps}>{component}</Tooltip>;
  },
);

CSwitch.displayName = "CSwitch";
export default CSwitch;
