import TextField, { TextFieldProps } from "@mui/material/TextField";
import React, { useRef, useState } from "react";

type CTextFieldProps = TextFieldProps & {
  errorMessage?: string;
  onRequiredCheck?: (filled: boolean) => void;
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
      onRequiredCheck,
      onChange,
      onBlur,
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
        {...rest}
      />
    );
  },
);

CTextField.displayName = "CTextField";

export default CTextField;
