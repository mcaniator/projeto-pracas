import { Divider } from "@mui/material";
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
  getLabel?: (option: T) => React.ReactNode;
  getValue?: (option: T) => string | number;
  onChange?: (event: React.MouseEvent<HTMLElement>, option: T) => void;
};

function CToggleButtonGroup<T>({
  options,
  mapValues = true,
  getLabel,
  getValue,
  onChange,
  sx,
  ...rest
}: CToggleButtonGroupProps<T>) {
  const defaultSx = {
    padding: { xs: "4px 4px", sm: "6px 6px" },
    bgcolor: "grey.100",
    width: "fit-content",
    boxShadow: "inset 0 0 4px rgba(0,0,0,0.3)",
  };

  const toggleButtonSx = {
    bgcolor: "grey.100",
    color: "black",
    border: "none",
    "&.Mui-selected": {
      bgcolor: "primary.main",
      color: "white",
      "&:hover": {
        bgcolor: "primary.main",
      },
    },
    "&:hover": {
      bgcolor: "grey.300",
    },

    boxShadow: "inset 0px 0px 1px rgba(0,0,0,0.50)",

    padding: { xs: "4px", sm: "8px" },
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
            <ToggleButton
              key={index}
              value={String(option)}
              sx={toggleButtonSx}
            >
              {String(option)}
            </ToggleButton>
            <Divider orientation="vertical" />
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
        {options.map((option) => (
          <ToggleButton
            key={String(getValue(option))}
            value={getValue(option)}
            sx={toggleButtonSx}
          >
            {getLabel(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    );
  }
}

export default CToggleButtonGroup;
