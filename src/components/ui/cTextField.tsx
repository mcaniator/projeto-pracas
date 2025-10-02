import { IconButton, InputAdornment } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { IconSearch, IconX } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";

type CTextFieldProps = TextFieldProps & {
  errorMessage?: string;
  isSearch?: boolean;
  clearable?: boolean;
  isAutocompleteInput?: boolean;
  onRequiredCheck?: (filled: boolean) => void;
  onEnterDown?: () => void;
  onSearch?: () => void;
};

const CTextField = React.forwardRef<HTMLInputElement, CTextFieldProps>(
  (props, ref) => {
    const {
      variant = "outlined",
      margin = "normal",
      size = "small",
      error,
      errorMessage,
      helperText,
      required = false,
      isSearch = false,
      clearable = false,
      isAutocompleteInput = false,
      slotProps,
      value,
      onKeyDown,
      onRequiredCheck,
      onChange,
      onBlur,
      onEnterDown,
      onSearch,
      ...rest
    } = props;
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState<string>("");
    const [mounted, setMounted] = useState(false); // SSR safe flag

    const validate = () => {
      const value = localValue;
      const valid = value.trim().length > 0;
      setIsValid(valid);
      if (required && onRequiredCheck) {
        onRequiredCheck(valid);
      }
      return valid;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        if (onEnterDown) {
          onEnterDown();
        }

        if (isSearch) {
          handleSearch();
        }
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const handleSearch = () => {
      if (onSearch) {
        onSearch();
      }
    };

    const handleClear = () => {
      setLocalValue("");
    };

    useEffect(() => {
      setLocalValue(value != undefined ? String(value) : "");
    }, [value]);

    useEffect(() => {
      setMounted(true);
    }, []);

    const endAdornment =
      mounted ?
        <InputAdornment position="end">
          {clearable ?
            localValue.length > 0 ?
              <IconButton edge="end" onClick={handleClear}>
                <IconX />
              </IconButton>
            : <div style={{ width: 28, height: 24 }} />
          : null}
          {isSearch && (
            <IconButton edge="end" onClick={handleSearch}>
              <IconSearch />
            </IconButton>
          )}
        </InputAdornment>
      : null;

    const inputProps = {
      input: {
        endAdornment,
      },
    };

    return (
      <TextField
        ref={ref}
        inputRef={inputRef}
        variant={variant}
        value={localValue}
        margin={margin}
        size={size}
        error={(required && !isValid) || error}
        helperText={(required && !isValid) || error ? errorMessage : helperText}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        slotProps={{
          ...slotProps,
          ...(!isAutocompleteInput ? inputProps : {}),
        }}
        {...rest}
      />
    );
  },
);

CTextField.displayName = "CTextField";

export default CTextField;
