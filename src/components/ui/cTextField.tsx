import { Box, IconButton, InputAdornment } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { IconSearch, IconX } from "@tabler/icons-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { readOnlyTextFieldSx } from "../../lib/theme/customSx";
import { createDebouncedFunction } from "../../lib/utils/ui";

type CTextFieldProps = Omit<TextFieldProps, "autoComplete"> & {
  errorMessage?: string;
  isSearch?: boolean;
  clearable?: boolean;
  isAutocompleteInput?: boolean;
  readOnly?: boolean;
  autoComplete?: boolean;
  resetOnFormSubmit?: boolean;
  appendIconButton?: React.ReactNode;
  maxCharacters?: number;
  debounce?: number;
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
      maxCharacters,
      readOnly,
      slotProps,
      defaultValue,
      autoComplete,
      label,
      debounce = 0,
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
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState<string>("");
    const [mounted, setMounted] = useState(false); // SSR safe flag
    const [characterCount, setCharacterCount] = useState(0);

    const debouncedOnChange = useMemo(
      () => createDebouncedFunction({ func: onChange, timeoutRef, debounce }),
      [debounce, onChange],
    );

    const validate = useCallback(() => {
      const value = localValue;
      const valid = value.trim().length > 0;
      setIsValid(valid);
      if (required && onRequiredCheck) {
        onRequiredCheck(valid);
      }
      return valid;
    }, [localValue, onRequiredCheck, required]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      if (maxCharacters && event.target.value.length > maxCharacters) {
        return;
      }
      /*if (required) {
        validate();
      }*/

      setLocalValue(event.target.value);

      if (debouncedOnChange) {
        debouncedOnChange(event);
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
      if (localValue === value) {
        return;
      }
      if (maxCharacters && String(value).length > maxCharacters) {
        const trimmedValue = String(value).substring(0, maxCharacters);
        if (onChange) {
          const event = {
            target: { value: trimmedValue },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(event);
        }
        setLocalValue(trimmedValue);
      } else {
        setLocalValue(value != undefined ? String(value) : "");
      }
    }, [value, maxCharacters, onChange]);

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

    useEffect(() => {
      if (required) {
        validate();
      }
      if (maxCharacters) {
        setCharacterCount(localValue.length);
      }
    }, [localValue, required, maxCharacters, validate]);

    const defaultSx = { mt: "0px", mb: "0px" };

    const readOnlySx = readOnly ? readOnlyTextFieldSx : undefined;

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
      <Box
        className="flex w-full flex-col"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          mt: label ? "8px" : "0px",
        }}
      >
        <TextField
          ref={ref}
          label={label}
          inputRef={inputRef}
          variant={variant}
          value={localValue}
          margin={margin}
          size={size}
          autoComplete={autoComplete ? "on" : "off"}
          error={(required && !isValid) || error}
          helperText={
            (required && !isValid) || error ? errorMessage : helperText
          }
          sx={{ ...sx, ...defaultSx, ...readOnlySx }}
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
        {maxCharacters && (
          <Box sx={{ ml: "8px" }}>
            {characterCount}/{maxCharacters}
          </Box>
        )}
      </Box>
    );
  },
);

CTextField.displayName = "CTextField";

export default CTextField;
