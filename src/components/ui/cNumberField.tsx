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
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  alignEndAdornmentWithText?: boolean;
  tooltip?: string;
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const raw = event.target.value;

      const filtered = raw.replace(/[^0-9+\-.]/g, "");
      const match = filtered.match(/^[-+]?\d*\.?\d*$/);

      if (!match || match[0] === localValue) return;
      const newLocalValue = match ? filtered : localValue;
      if (newLocalValue !== "+" && newLocalValue !== ".") {
        setLocalValue(newLocalValue);
      }

      if (required) {
        validate();
      }
      if (debouncedOnChange) {
        if (
          newLocalValue === "" ||
          newLocalValue === "-" ||
          newLocalValue === "+" ||
          newLocalValue === "."
        ) {
          debouncedOnChange(null);
        } else {
          debouncedOnChange(Number(newLocalValue));
        }
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (required) {
        validate();
      }
      if (onBlur) {
        onBlur(event);
      }
    };

    const handleIncrement = () => {
      const next = String(Number(localValue || 0) + 1);
      setLocalValue(() => {
        return next;
      });
      forceFireOnChange(next);
    };

    const handleDecrement = () => {
      const next = String(Number(localValue || 0) - 1);
      setLocalValue(() => {
        return next;
      });
      forceFireOnChange(next);
    };

    const forceFireOnChange = (next: string) => {
      if (debouncedOnChange) {
        if (next === "") {
          debouncedOnChange(null);
        } else {
          debouncedOnChange(Number(next));
        }
      }
    };
    useEffect(() => {
      setLocalValue(value != undefined ? String(value) : "");
      if (readOnly && onChange) {
        onChange(value != undefined ? Number(value) : null);
      }
    }, [value, readOnly, onChange]);

    useEffect(() => {
      if (defaultValue) {
        setLocalValue(String(defaultValue));
      }
    }, [defaultValue]);

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
            (required && !isValid) || error ? errorMessage : helperText
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
            htmlInput: {
              inputMode: "decimal",
            },
            input: {
              endAdornment: !disabled && !readOnly && (
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
