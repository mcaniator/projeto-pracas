import { SxProps, Theme, Tooltip } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup, {
  ToggleButtonGroupProps,
} from "@mui/material/ToggleButtonGroup";
import React from "react";

type CToggleButtonGroupProps<T> = Omit<
  ToggleButtonGroupProps,
  "onChange" | "exclusive"
> & {
  options: T[];
  value: number | string | null | undefined;
  mapValues?: boolean;
  toggleButtonSx?: SxProps<Theme>;
  toggleButtonColor?: string;
  getLabel?: (option: T) => React.ReactNode;
  getValue?: (option: T) => string | number;
  getTooltip?: (option: T) => string;
  onChange?: (event: React.MouseEvent<HTMLElement>, option: T) => void;
};

function CToggleButtonGroup<T>({
  options,
  mapValues = true,
  toggleButtonSx,
  toggleButtonColor,
  getLabel,
  getValue,
  onChange,
  getTooltip,
  sx,
  ...rest
}: CToggleButtonGroupProps<T>) {
  const defaultSx = {
    padding: { xs: "4px 4px", sm: "6px 6px" },
    bgcolor: "grey.100",
    width: "fit-content",
    boxShadow: "inset 0 0 4px rgba(0,0,0,0.3)",
  };

  const computedToggleButtonSx = {
    color: "black",
    borderTop: "none",
    borderBottom: "none",
    "&.Mui-selected": {
      bgcolor: toggleButtonColor ?? "gray",
      color: "white",
      "&:hover": {
        bgcolor: toggleButtonColor ?? "gray",
      },
    },
    "&:hover": {
      bgcolor: "grey.300",
    },

    padding: { xs: "4px", sm: "8px" },
    ...toggleButtonSx,
  };

  if (!mapValues) {
    return (
      <ToggleButtonGroup
        sx={{ ...defaultSx, ...sx }}
        exclusive
        {...rest}
        onChange={(e, newValue) => {
          const selected = options.find((o) => o === newValue);
          if (onChange && selected) onChange(e, selected);
        }}
      >
        {options.map((option, index) => (
          <>
            {getTooltip ?
              <Tooltip key={index} title={getTooltip(option)}>
                <ToggleButton
                  value={String(option)}
                  sx={computedToggleButtonSx}
                >
                  {String(option)}
                </ToggleButton>
              </Tooltip>
            : <ToggleButton
                key={index}
                value={String(option)}
                sx={computedToggleButtonSx}
              >
                {String(option)}
              </ToggleButton>
            }
          </>
        ))}
      </ToggleButtonGroup>
    );
  } else {
    if (!getLabel || !getValue) {
      throw new Error(
        "CToggleButtonGroup with mapValues prop, but without getLabel or getValue defined",
      );
    }
    return (
      <ToggleButtonGroup
        sx={{ ...defaultSx, ...sx }}
        exclusive
        {...rest}
        onChange={(e, newValue) => {
          const selected = options.find((o) => getValue(o) === newValue);
          if (onChange && selected) onChange(e, selected);
        }}
      >
        {options.map((option, index) =>
          getTooltip ?
            <Tooltip key={index} title={getTooltip(option)} enterTouchDelay={0}>
              <ToggleButton
                key={String(getValue(option))}
                value={getValue(option)}
                sx={computedToggleButtonSx}
              >
                {getLabel(option)}
              </ToggleButton>
            </Tooltip>
          : <ToggleButton
              key={index}
              value={getValue(option)}
              sx={computedToggleButtonSx}
            >
              {getLabel(option)}
            </ToggleButton>,
        )}
      </ToggleButtonGroup>
    );
  }
}

export default CToggleButtonGroup;
