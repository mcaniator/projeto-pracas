import { IconButton, InputAdornment, Tooltip } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { readOnlyTextFieldSx } from "../../lib/theme/customSx";
import { createDebouncedFunction } from "../../lib/utils/ui";

type CNumberFieldProps = Omit<TextFieldProps, "onChange"> & {
  errorMessage?: string;
  readOnly?: boolean;
  debounce?: number;
  minValue?: number;
  maxValue?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  alignEndAdornmentWithText?: boolean;
  tooltip?: string;
  defaultValue?: number | null;
  value?: number | null;
  onRequiredCheck?: (filled: boolean) => void;
  onChange?: (value: number | null) => void;
};

const CNumberField = React.forwardRef<HTMLInputElement, CNumberFieldProps>(
  (props, ref) => {
    const {
      variant = "outlined",
      margin = "normal",
      size = "small",
      error,
      errorMessage,
      helperText,
      required = false,
      value,
      disabled,
      readOnly,
      label,
      minValue,
      maxValue,
      startAdornment,
      endAdornment,
      tooltip,
      alignEndAdornmentWithText,
      defaultValue,
      debounce = 0,
      sx,
      onRequiredCheck,
      onChange,
      onBlur,
      ...rest
    } = props;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const readOnlySx = readOnly ? readOnlyTextFieldSx : undefined;
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState("");

    const debouncedOnChange = useMemo(
      () => createDebouncedFunction({ func: onChange, timeoutRef, debounce }),
      [debounce, onChange],
    );

    const validate = () => {
      const value = inputRef?.current?.value ?? "";
      const valid = value.trim().length > 0;
      setIsValid(valid);
      if (required && onRequiredCheck) {
        onRequiredCheck(valid);
      }
      return valid;
    };

    const normalizeNumber = (value: string) => value.replace(",", ".");
    const formatNumber = (value: number | null | string | undefined) => {
      if (value == null) return "";
      return String(value).replace(".", ",");
    };
    const isIncompleteNumber = (value: string) =>
      value === "" ||
      value === "-" ||
      value === "+" ||
      value === "." ||
      value === "," ||
      value.endsWith(".") ||
      value.endsWith(",");

    const clampNumber = (value: number) => {
      const hasMin = Number.isFinite(minValue);
      const hasMax = Number.isFinite(maxValue);
      if (!hasMin || !hasMax) return value;
      if (minValue! > maxValue!) return value;
      return Math.min(Math.max(value, minValue!), maxValue!);
    };

    const applyClampedNumber = (value: number) => {
      const clamped = clampNumber(value);
      setLocalValue(formatNumber(clamped));
      if (debouncedOnChange) {
        debouncedOnChange(clamped);
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const raw = event.target.value;

      const filtered = raw.replace(/[^0-9+\-.,]/g, "");
      const match = filtered.match(/^[-+]?\d*(?:[.,]?\d*)?$/);

      if (!match || match[0] === localValue) return;
      const newLocalValue = match ? filtered : localValue;
      if (required) {
        validate();
      }
      if (newLocalValue.trim() === "") {
        setLocalValue(formatNumber(newLocalValue));
        if (debouncedOnChange) {
          debouncedOnChange(null);
        }
        return;
      }
      if (isIncompleteNumber(newLocalValue)) {
        setLocalValue(formatNumber(newLocalValue));
        return;
      }

      const parsed = Number(normalizeNumber(newLocalValue));
      if (!Number.isFinite(parsed)) {
        setLocalValue(formatNumber(newLocalValue));
        return;
      }

      applyClampedNumber(parsed);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (required) {
        validate();
      }
      const current = inputRef.current?.value ?? "";
      if (current.trim() !== "" && isIncompleteNumber(current)) {
        setLocalValue(formatNumber(value));
      }
      if (onBlur) {
        onBlur(event);
      }
    };

    const handleIncrement = () => {
      const base = Number(normalizeNumber(localValue));
      const safeBase = Number.isFinite(base) ? base : 0;
      applyClampedNumber(safeBase + 1);
    };

    const handleDecrement = () => {
      const base = Number(normalizeNumber(localValue));
      const safeBase = Number.isFinite(base) ? base : 0;
      applyClampedNumber(safeBase - 1);
    };
    useEffect(() => {
      const currentInput = inputRef.current?.value ?? "";
      if (currentInput.trim() !== "" && isIncompleteNumber(currentInput))
        return;
      const clampedValue = value == null ? null : clampNumber(Number(value));
      setLocalValue(formatNumber(clampedValue));
      if (readOnly && onChange) {
        onChange(clampedValue != undefined ? Number(clampedValue) : null);
      }
    }, [value, readOnly, onChange, minValue, maxValue]);

    useEffect(() => {
      if (defaultValue != null) {
        const clampedValue = clampNumber(Number(defaultValue));
        setLocalValue(formatNumber(clampedValue));
      }
    }, [defaultValue, minValue, maxValue]);

    useEffect(() => {
      const currentInput = inputRef.current?.value ?? "";
      if (currentInput.trim() === "" || isIncompleteNumber(currentInput)) {
        return;
      }
      const parsed = Number(normalizeNumber(currentInput));
      if (!Number.isFinite(parsed)) return;
      applyClampedNumber(parsed);
    }, [minValue, maxValue]);

    return (
      <Tooltip title={tooltip} enterTouchDelay={0}>
        <TextField
          ref={ref}
          label={label}
          defaultValue={undefined}
          inputRef={inputRef}
          variant={variant}
          margin={margin}
          size={size}
          value={localValue}
          disabled={disabled || readOnly}
          type="text"
          error={(required && !isValid) || error}
          helperText={
            (required && !isValid) || error ? errorMessage
            : minValue || maxValue ?
              `Digite um valor entre ${minValue} e ${maxValue}`
            : helperText
          }
          onChange={handleChange}
          onBlur={handleBlur}
          sx={{
            mb: 0,
            mt: label ? "8px" : "0px",
            ...sx,
            ...readOnlySx,
            "& input[type=number]::-webkit-inner-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            "& input[type=number]::-webkit-outer-spin-button": {
              WebkitAppearance: "none",
              margin: 0,
            },
            "& input[type=number]": {
              MozAppearance: "textfield",
            },
            "& .MuiInputBase-sizeSmall .MuiOutlinedInput-input": {
              paddingTop: label ? "12px" : "6px",
              paddingBottom: label ? "0px" : "6px",
            },
            "& .MuiInputLabel-root": {
              pr: "32px",
            },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <div className="flex items-center gap-1">
                    <div className={alignEndAdornmentWithText ? "mt-4" : ""}>
                      {endAdornment}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                      }}
                    >
                      {!disabled && !readOnly && (
                        <>
                          <IconButton
                            size="small"
                            style={{ padding: 0 }}
                            onClick={handleIncrement}
                          >
                            <IconChevronUp fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            style={{ padding: 0 }}
                            onClick={handleDecrement}
                          >
                            <IconChevronDown fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </div>
                </InputAdornment>
              ),
              startAdornment:
                startAdornment ?
                  <InputAdornment position="start">
                    {startAdornment}
                  </InputAdornment>
                : undefined,
            },
          }}
          {...rest}
        />
      </Tooltip>
    );
  },
);

CNumberField.displayName = "CNumberField";

export default CNumberField;
