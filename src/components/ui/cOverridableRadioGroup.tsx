"use client";

import dayjs from "@/lib/dayjs";
import type {
  RadioOverrideOption,
  RadioOverrideValue,
  RadioValueWithOverride,
} from "@/lib/types/overridableOptionsComponents";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from "@mui/material";
import type { QuestionResponseCharacterTypes } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

import CDatePicker from "./cDatePicker";
import CDateTimePicker from "./cDateTimePicker";
import CNumberField from "./cNumberField";
import CSwitch from "./cSwtich";
import CTextField from "./cTextField";
import CTimePicker from "./cTimePicker";

//TODO: Change override type accordingly to overrideType
type COverridableRadioGroupProps<
  T,
  V extends string | number | boolean = string,
> = Omit<RadioGroupProps, "value" | "onChange"> & {
  label?: string;
  options: Array<T & RadioOverrideOption>;
  overrideType: QuestionResponseCharacterTypes;
  minValue?: number | null;
  maxValue?: number | null;
  value?: RadioValueWithOverride<V> | null;
  clearable?: boolean;
  disableBorder?: boolean;
  readOnly?: boolean;
  name?: string;
  getOptionLabel: (option: T & RadioOverrideOption) => string;
  getOptionValue: (option: T & RadioOverrideOption) => V;
  onChange?: (value: RadioValueWithOverride<V> | null) => void;
};

function COverridableRadioGroup<
  T,
  V extends string | number | boolean = string,
>({
  options,
  overrideType,
  minValue,
  maxValue,
  value,
  label,
  clearable,
  disableBorder,
  name,
  readOnly,
  onChange,
  getOptionLabel,
  getOptionValue,
  ...props
}: COverridableRadioGroupProps<T, V>) {
  const [localValue, setLocalValue] =
    useState<RadioValueWithOverride<V> | null>(null);

  const borderSx =
    disableBorder ?
      {}
    : {
        borderWidth: readOnly ? "2px" : "1px",
        borderStyle: readOnly ? "dashed" : "solid",
        borderColor: "#ccc",
      };

  const handleClear = () => {
    setLocalValue(null);
    onChange?.(null);
  };

  const emitChange = (nextValue: RadioValueWithOverride<V> | null) => {
    setLocalValue(nextValue);
    onChange?.(nextValue);
  };

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    val: string,
  ) => {
    if (readOnly) return;
    const selectedOption = options.find(
      (opt) => String(getOptionValue(opt)) === val,
    );

    if (!selectedOption) return;

    emitChange({ value: getOptionValue(selectedOption), override: null });
  };

  const handleOverrideChange = (override: RadioOverrideValue) => {
    if (readOnly || !localValue) return;

    emitChange({ ...localValue, override });
  };

  const renderOverrideField = (
    option: T & RadioOverrideOption,
    optionValue: V,
  ) => {
    if (!option.isOverridable || localValue?.value !== optionValue) {
      return null;
    }

    switch (overrideType) {
      case "NUMBER":
      case "SCALE":
        return (
          <CNumberField
            fullWidth
            clearable
            readOnly={readOnly}
            minValue={
              overrideType === "SCALE" ? (minValue ?? undefined) : undefined
            }
            maxValue={
              overrideType === "SCALE" ? (maxValue ?? undefined) : undefined
            }
            value={
              typeof localValue.override === "number" ?
                localValue.override
              : null
            }
            onChange={handleOverrideChange}
          />
        );
      case "PERCENTAGE":
        return (
          <CNumberField
            fullWidth
            clearable
            readOnly={readOnly}
            endAdornment="%"
            value={
              typeof localValue.override === "number" ?
                localValue.override
              : null
            }
            onChange={handleOverrideChange}
          />
        );
      case "BOOLEAN":
        return (
          <CSwitch
            readOnly={readOnly}
            checked={
              typeof localValue.override === "boolean" ?
                localValue.override
              : false
            }
            onChange={(event) => handleOverrideChange(event.target.checked)}
          />
        );
      case "DATE":
        return (
          <CDatePicker
            className="w-full"
            clearable
            readOnly={readOnly}
            value={
              dayjs.isDayjs(localValue.override) ? localValue.override : null
            }
            onChange={(nextValue: Dayjs | null) =>
              handleOverrideChange(nextValue === null ? dayjs("") : nextValue)
            }
          />
        );
      case "TIME":
        return (
          <CTimePicker
            className="w-full"
            clearable
            readOnly={readOnly}
            value={
              dayjs.isDayjs(localValue.override) ? localValue.override : null
            }
            onChange={(nextValue: Dayjs | null) =>
              handleOverrideChange(nextValue === null ? dayjs("") : nextValue)
            }
          />
        );
      case "DATETIME":
        return (
          <CDateTimePicker
            className="w-full"
            clearable
            readOnly={readOnly}
            value={
              dayjs.isDayjs(localValue.override) ? localValue.override : null
            }
            onChange={(nextValue: Dayjs | null) =>
              handleOverrideChange(nextValue === null ? dayjs("") : nextValue)
            }
          />
        );
      case "TEXT":
      default:
        return (
          <CTextField
            fullWidth
            clearable
            readOnly={readOnly}
            value={
              typeof localValue.override === "string" ? localValue.override : ""
            }
            onChange={(event) => handleOverrideChange(event.target.value)}
          />
        );
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
          {label}
          {clearable && localValue !== null && !readOnly && (
            <IconButton onClick={handleClear}>
              <IconX />
            </IconButton>
          )}
        </FormLabel>
      )}
      <RadioGroup
        name={name}
        value={localValue !== null ? String(localValue.value) : ""}
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
          const isSelected = localValue?.value === optionValue;

          return (
            <Box key={index} sx={{ mb: isSelected ? 1.5 : 0 }}>
              <FormControlLabel
                value={String(optionValue)}
                control={<Radio />}
                label={optionLabel}
              />
              <Box sx={{ ml: 1 }}>
                {renderOverrideField(option, optionValue)}
              </Box>
            </Box>
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

COverridableRadioGroup.displayName = "COverridableRadioGroup";
export default COverridableRadioGroup;
