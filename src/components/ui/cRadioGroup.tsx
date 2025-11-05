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

type CRadioGroupProps<T, V extends string | number | boolean = string> = Omit<
  RadioGroupProps,
  "value" | "onChange"
> & {
  label?: string;
  options: T[];
  value?: V | null;
  clearable?: boolean;
  disableBorder?: boolean;
  name?: string;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => V;
  onChange?: (value: V | null) => void;
};

function CRadioGroup<T, V extends string | number | boolean = string>({
  options,
  value,
  label,
  clearable,
  disableBorder,
  name,
  onChange,
  getOptionLabel,
  getOptionValue,
  ...props
}: CRadioGroupProps<T, V>) {
  const [localValue, setLocalValue] = useState<V | null>(null);
  const borderSx = disableBorder ? {} : { border: "1px solid #ccc" };

  const handleClear = () => {
    setLocalValue(null);
    onChange?.(null);
  };

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    val: string,
  ) => {
    const selectedOption = options.find(
      (opt) => String(getOptionValue(opt)) === val,
    );

    if (!selectedOption) return;

    const realValue = getOptionValue(selectedOption);
    setLocalValue(realValue);
    onChange?.(realValue);
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
          {label}
          {clearable && localValue !== null && (
            <IconButton onClick={handleClear}>
              <IconX />
            </IconButton>
          )}
        </FormLabel>
      )}
      <RadioGroup
        name={name}
        value={localValue !== null ? String(localValue) : ""}
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
              value={String(optionValue)}
              control={<Radio />}
              label={optionLabel}
            />
          );
        })}
        {!label && clearable && !!localValue && (
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
