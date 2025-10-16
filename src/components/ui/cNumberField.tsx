import { IconButton, InputAdornment } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";

type CNumberFieldProps = Omit<TextFieldProps, "onChange"> & {
  errorMessage?: string;
  readOnly?: boolean;
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
      sx,
      onRequiredCheck,
      onChange,
      onBlur,
      ...rest
    } = props;
    const readOnlySx =
      readOnly ?
        {
          "& .MuiOutlinedInput-notchedOutline": {
            borderStyle: "dashed",
            borderColor: "gray",
            borderWidth: "2px",
          },
          "& .MuiOutlinedInput-input": {
            cursor: "not-allowed",
          },
        }
      : undefined;
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState("");

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
      if (onChange) {
        if (
          newLocalValue === "" ||
          newLocalValue === "-" ||
          newLocalValue === "+" ||
          newLocalValue === "."
        ) {
          onChange(null);
        } else {
          onChange(Number(newLocalValue));
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
      if (onChange) {
        if (next === "") {
          onChange(null);
        } else {
          onChange(Number(next));
        }
      }
    };
    useEffect(() => {
      setLocalValue(value != undefined ? String(value) : "");
    }, [value]);

    return (
      <TextField
        ref={ref}
        label={label}
        inputRef={inputRef}
        variant={variant}
        margin={margin}
        size={size}
        value={localValue}
        disabled={disabled}
        type="text"
        inputMode="numeric"
        error={(required && !isValid) || error}
        helperText={(required && !isValid) || error ? errorMessage : helperText}
        onChange={handleChange}
        onBlur={handleBlur}
        sx={{ mb: 0, mt: label ? "8px" : "0px", ...sx, ...readOnlySx }}
        slotProps={{
          input: {
            endAdornment: !disabled && !readOnly && (
              <InputAdornment position="end">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 0 }}
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
              </InputAdornment>
            ),
          },
        }}
        {...rest}
      />
    );
  },
);

CNumberField.displayName = "CNumberField";

export default CNumberField;
