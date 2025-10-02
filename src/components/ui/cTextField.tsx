import { IconButton, InputAdornment } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import { IconSearch } from "@tabler/icons-react";
import React, { useRef, useState } from "react";

type CTextFieldProps = TextFieldProps & {
  errorMessage?: string;
  isSearch?: boolean;
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
      slotProps,
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

    const searchProps =
      isSearch ?
        {
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={handleSearch}>
                  <IconSearch />
                </IconButton>
              </InputAdornment>
            ),
          },
        }
      : {};

    return (
      <TextField
        ref={ref}
        inputRef={inputRef}
        variant={variant}
        margin={margin}
        size={size}
        error={(required && !isValid) || error}
        helperText={(required && !isValid) || error ? errorMessage : helperText}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        slotProps={{ ...slotProps, ...searchProps }}
        {...rest}
      />
    );
  },
);

CTextField.displayName = "CTextField";

export default CTextField;
