import {
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type CRadioGroupProps<T> = Omit<RadioGroupProps, "value" | "onChange"> & {
  label?: string;
  options: T[];
  value?: string | number | boolean | null;
  clearable?: boolean;
  disableBorder?: boolean;
  isNumber?: boolean;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
};

function CRadioGroup<T>({
  options,
  value,
  label,
  clearable,
  disableBorder,
  isNumber,
  onChange,
  getOptionLabel,
  getOptionValue,
  ...props
}: CRadioGroupProps<T>) {
  const [localValue, setLocalValue] = useState<
    number | string | boolean | null
  >("");
  const borderSx = disableBorder ? {} : { border: "1px solid #ccc" };

  const handleClear = () => {
    setLocalValue(null);
    if (onChange) {
      onChange("");
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    val: string,
  ) => {
    if (onChange) {
      onChange(isNumber ? Number(val) : val);
    } else {
      setLocalValue(isNumber ? Number(val) : val);
    }
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
            borderTopRightRadius: "16px",
            borderTopLeftRadius: "16px",
            ...borderSx,
          }}
        >
          {label}{" "}
          {clearable && localValue && (
            <IconButton onClick={handleClear}>
              <IconX />
            </IconButton>
          )}
        </FormLabel>
      )}
      <RadioGroup
        value={localValue}
        onChange={handleChange}
        sx={{
          px: 1,
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          borderTopLeftRadius: label ? "0px" : "16px",
          borderTopRightRadius: label ? "0px" : "16px",
          ...borderSx,
        }}
        {...props}
      >
        {options.map((option, index) => {
          const optionValue = getOptionValue(option);
          const optionLabel = getOptionLabel(option);
          return (
            <FormControlLabel
              key={index}
              value={optionValue}
              control={<Radio />}
              label={optionLabel}
            />
          );
        })}
        {!label && clearable && localValue && (
          <IconButton sx={{ width: "fit-content" }} onClick={handleClear}>
            <IconX />
          </IconButton>
        )}
      </RadioGroup>
    </FormControl>
  );
}

CRadioGroup.displayName = "CRadioGroup";

export default CRadioGroup;
