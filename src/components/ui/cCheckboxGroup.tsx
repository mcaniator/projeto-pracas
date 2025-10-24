"use client";

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type CCheckboxGroupProps<T, V extends string | number | boolean = string> = {
  label?: string;
  options: T[];
  value?: Array<string | number | boolean>;
  clearable?: boolean;
  disableBorder?: boolean;
  name?: string;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => V;
  onChange?: (value: V[]) => void;
};

function CCheckboxGroup<T, V extends string | number | boolean = string>({
  options,
  value = [],
  label,
  clearable,
  disableBorder,
  name,
  onChange,
  getOptionLabel,
  getOptionValue,
}: CCheckboxGroupProps<T, V>) {
  const [localValue, setLocalValue] = useState<(string | number | boolean)[]>(
    [],
  );

  const borderSx = disableBorder ? {} : { border: "1px solid #ccc" };

  const handleClear = () => {
    setLocalValue([]);
    onChange?.([]);
  };

  const handleToggle = (val: V) => {
    const newValue =
      localValue.includes(val) ?
        (localValue.filter((v) => v !== val) as V[])
      : ([...localValue, val] as V[]);
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  useEffect(() => {
    if (value === undefined) return;
    setLocalValue(value);
  }, [value]);

  return (
    <FormControl>
      {label && (
        <FormLabel
          sx={{
            height: "40px",
            display: "flex",
            alignItems: "center",
            px: 1,
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            ...borderSx,
          }}
        >
          {label}
          {clearable && localValue.length > 0 && (
            <IconButton onClick={handleClear} size="small">
              <IconX />
            </IconButton>
          )}
        </FormLabel>
      )}
      <FormGroup
        sx={{
          px: 1,
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          borderTopLeftRadius: label ? "0px" : "16px",
          borderTopRightRadius: label ? "0px" : "16px",
          ...borderSx,
        }}
      >
        {options.map((option, index) => {
          const optionValue = getOptionValue(option);
          const optionLabel = getOptionLabel(option);
          return (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  name={name}
                  value={optionValue}
                  checked={localValue.includes(optionValue)}
                  onChange={() => handleToggle(optionValue)}
                />
              }
              label={optionLabel}
            />
          );
        })}
        {!label && clearable && localValue && (
          <IconButton sx={{ width: "fit-content" }} onClick={handleClear}>
            <IconX />
          </IconButton>
        )}
      </FormGroup>
    </FormControl>
  );
}

CCheckboxGroup.displayName = "CCheckboxGroup";

export default CCheckboxGroup;
