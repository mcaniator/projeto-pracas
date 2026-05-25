"use client";

import dayjs from "@/lib/dayjs";
import type {
  CheckboxOverrideOption,
  CheckboxValueWithOverride,
  OverrideType,
  OverrideValueByType,
} from "@/lib/types/overridableOptionsComponents";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

import CCheckbox from "./cCheckbox";
import CDatePicker from "./cDatePicker";
import CDateTimePicker from "./cDateTimePicker";
import CNumberField from "./cNumberField";
import CSwitch from "./cSwtich";
import CTextField from "./cTextField";
import CTimePicker from "./cTimePicker";

type COverridableCheckboxGroupProps<
  T,
  V extends string | number | boolean = string,
  O extends OverrideType = "TEXT",
> = {
  label?: string;
  options: Array<T & CheckboxOverrideOption>;
  overrideType: O;
  minValue?: number | null;
  maxValue?: number | null;
  value?: Array<CheckboxValueWithOverride<V, OverrideValueByType[O]>>;
  clearable?: boolean;
  disableBorder?: boolean;
  name?: string;
  readOnly?: boolean;
  getOptionLabel: (option: T & CheckboxOverrideOption) => string;
  getOptionValue: (option: T & CheckboxOverrideOption) => V;
  onChange?: (
    value: CheckboxValueWithOverride<V, OverrideValueByType[O]>[],
  ) => void;
};

function COverridableCheckboxGroup<
  T,
  V extends string | number | boolean = string,
  O extends OverrideType = "TEXT",
>({
  options,
  overrideType,
  value = [],
  label,
  clearable,
  disableBorder,
  name,
  readOnly,
  onChange,
  getOptionLabel,
  getOptionValue,
}: COverridableCheckboxGroupProps<T, V, O>) {
  const [localValue, setLocalValue] = useState<
    CheckboxValueWithOverride<V, OverrideValueByType[O]>[]
  >([]);

  const borderSx =
    disableBorder ?
      {}
    : {
        borderWidth: readOnly ? "2px" : "1px",
        borderStyle: readOnly ? "dashed" : "solid",
        borderColor: "#ccc",
      };

  const handleClear = () => {
    setLocalValue([]);
    onChange?.([]);
  };

  const getSelectedItem = (val: V) => {
    return localValue.find((item) => item.value === val);
  };

  const emitChange = (
    nextValue: CheckboxValueWithOverride<V, OverrideValueByType[O]>[],
  ) => {
    setLocalValue(nextValue);
    onChange?.(nextValue);
  };

  const handleToggle = (val: V) => {
    if (readOnly) return;
    const isChecked = localValue.some((item) => item.value === val);
    const newValue =
      isChecked ?
        localValue.filter((item) => item.value !== val)
      : [
          ...localValue,
          { value: val, override: null as OverrideValueByType[O] },
        ];

    emitChange(newValue);
  };

  const handleOverrideChange = (
    val: V,
    override: OverrideValueByType[OverrideType],
  ) => {
    if (readOnly) return;

    const nextValue = localValue.map((item) =>
      item.value === val ?
        { ...item, override: override as OverrideValueByType[O] }
      : item,
    );

    emitChange(nextValue);
  };

  const renderOverrideField = (
    option: T & CheckboxOverrideOption,
    optionValue: V,
  ) => {
    if (!option.isOverridable) {
      return null;
    }

    const selectedItem = getSelectedItem(optionValue);

    if (!selectedItem) {
      return null;
    }

    switch (overrideType) {
      case "NUMBER":
        return (
          <CNumberField
            fullWidth
            clearable
            readOnly={readOnly}
            value={
              typeof selectedItem.override === "number" ?
                selectedItem.override
              : null
            }
            onChange={(nextValue) =>
              handleOverrideChange(optionValue, nextValue)
            }
          />
        );
      case "BOOLEAN":
        return (
          <CSwitch
            readOnly={readOnly}
            checked={
              typeof selectedItem.override === "boolean" ?
                selectedItem.override
              : false
            }
            onChange={(event) =>
              handleOverrideChange(optionValue, event.target.checked)
            }
          />
        );
      case "DATE":
        return (
          <CDatePicker
            className="w-full"
            clearable
            readOnly={readOnly}
            value={
              dayjs.isDayjs(selectedItem.override) ?
                selectedItem.override
              : null
            }
            onChange={(nextValue: Dayjs | null) =>
              handleOverrideChange(
                optionValue,
                nextValue === null ? dayjs("") : nextValue,
              )
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
              dayjs.isDayjs(selectedItem.override) ?
                selectedItem.override
              : null
            }
            onChange={(nextValue: Dayjs | null) =>
              handleOverrideChange(
                optionValue,
                nextValue === null ? dayjs("") : nextValue,
              )
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
              dayjs.isDayjs(selectedItem.override) ?
                selectedItem.override
              : null
            }
            onChange={(nextValue: Dayjs | null) =>
              handleOverrideChange(
                optionValue,
                nextValue === null ? dayjs("") : nextValue,
              )
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
              typeof selectedItem.override === "string" ?
                selectedItem.override
              : ""
            }
            onChange={(event) =>
              handleOverrideChange(optionValue, event.target.value)
            }
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
            <Box
              key={index}
              sx={{ mb: getSelectedItem(optionValue) ? 1.5 : 0 }}
            >
              <FormControlLabel
                sx={{
                  marginLeft: "0px",
                }}
                control={
                  <CCheckbox
                    name={name}
                    value={optionValue}
                    checked={!!getSelectedItem(optionValue)}
                    onChange={() => handleToggle(optionValue)}
                  />
                }
                label={optionLabel}
              />
              <Box sx={{ ml: 1 }}>
                {renderOverrideField(option, optionValue)}
              </Box>
            </Box>
          );
        })}
        {!label && clearable && localValue.length > 0 && !readOnly && (
          <IconButton sx={{ width: "fit-content" }} onClick={handleClear}>
            <IconX />
          </IconButton>
        )}
      </FormGroup>
    </FormControl>
  );
}

COverridableCheckboxGroup.displayName = "COverridableCheckboxGroup";

export default COverridableCheckboxGroup;
