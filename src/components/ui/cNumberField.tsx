import { IconButton, InputAdornment } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";

type CNumberFieldProps = TextFieldProps & {
  errorMessage?: string;
  onRequiredCheck?: (filled: boolean) => void;
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
      onRequiredCheck,
      onChange,
      onBlur,
      ...rest
    } = props;
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
      const raw = event.target.value;

      const filtered = raw.replace(/[^0-9+\-.]/g, "");
      const match = filtered.match(/^[-+]?\d*\.?\d*$/);

      setLocalValue((prev) => (match ? filtered : prev));

      if (required) {
        validate();
      }
      if (onChange) {
        onChange(event);
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

    const handleIncrement = () =>
      setLocalValue((prev) => String(Number(prev || 0) + 1));
    const handleDecrement = () =>
      setLocalValue((prev) => String(Number(prev || 0) - 1));

    useEffect(() => {
      setLocalValue(value != undefined ? String(value) : "");
    }, [value]);

    return (
      <TextField
        ref={ref}
        inputRef={inputRef}
        variant={variant}
        margin={margin}
        size={size}
        value={localValue}
        type="text"
        inputMode="numeric"
        error={(required && !isValid) || error}
        helperText={(required && !isValid) || error ? errorMessage : helperText}
        onChange={handleChange}
        onBlur={handleBlur}
        slotProps={{
          input: {
            endAdornment: (
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
