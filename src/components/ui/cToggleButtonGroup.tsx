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
  getLabel: (option: T) => React.ReactNode;
  getValue: (option: T) => string | number;
  onChange?: (event: React.MouseEvent<HTMLElement>, option: T) => void;
};

function CToggleButtonGroup<T>({
  options,
  getLabel,
  getValue,
  onChange,
  sx,
  ...rest
}: CToggleButtonGroupProps<T>) {
  const defaultSx = {
    padding: "6px 6px",
    bgcolor: "grey.100",
    width: "fit-content",
    boxShadow: "inset 0 0 4px rgba(0,0,0,0.3)",
  };

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
          sx={{
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
          }}
        >
          {getLabel(option)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export default CToggleButtonGroup;
