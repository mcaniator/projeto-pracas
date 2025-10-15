import { IconButton, InputAdornment } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { IconSearch, IconX } from "@tabler/icons-react";
import React, { useEffect, useRef, useState } from "react";

type CTextFieldProps = TextFieldProps & {
  errorMessage?: string;
  isSearch?: boolean;
  clearable?: boolean;
  isAutocompleteInput?: boolean;
  readOnly?: boolean;
  resetOnFormSubmit?: boolean;
  appendIconButton?: React.ReactNode;
  onRequiredCheck?: (filled: boolean) => void;
  onEnterDown?: () => void;
  onSearch?: () => void;
  onAppendIconButtonClick?: () => void;
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
      resetOnFormSubmit,
      appendIconButton,
      readOnly,
      slotProps,
      defaultValue,
      sx,
      value,
      onKeyDown,
      onRequiredCheck,
      onChange,
      onBlur,
      onEnterDown,
      onSearch,
      onAppendIconButtonClick,
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
      if (readOnly) return;
      if (required) {
        validate();
      }
      if (onChange) {
        onChange(event);
      }
      if (!value) {
        setLocalValue(event.target.value);
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

    const handleAppendIconButtonClick = () => {
      if (onAppendIconButtonClick) {
        onAppendIconButtonClick();
      }
    };

    useEffect(() => {
      setLocalValue(value != undefined ? String(value) : "");
    }, [value]);

    useEffect(() => {
      setMounted(true);
      if (resetOnFormSubmit) {
        const parentForm = inputRef.current?.closest("form");
        if (parentForm) {
          parentForm.addEventListener("reset", handleClear);
          return () => parentForm.removeEventListener("reset", handleClear);
        }
      }
    }, [resetOnFormSubmit]);

    useEffect(() => {
      if (defaultValue) {
        setLocalValue(String(defaultValue));
      }
    }, [defaultValue]);

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

    const endAdornment =
      mounted ?
        <InputAdornment position="end">
          {appendIconButton ?
            <IconButton edge="end" onClick={handleAppendIconButtonClick}>
              {appendIconButton}
            </IconButton>
          : null}
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
        sx={{ ...sx, ...readOnlySx }}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        required={required}
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
