import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Tooltip,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { TextFieldProps } from "@mui/material/TextField";
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

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
}

const CNumberField = React.forwardRef<HTMLInputElement, CNumberFieldProps>(
  (props, ref) => {
    const {
      id: idProp,
      name,
      className,
      fullWidth,
      placeholder,
      autoFocus,
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
    } = props;

    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isValid, setIsValid] = useState(true);
    const [optimisticValue, setOptimisticValue] = useState<number | null>(
      value ?? null,
    );

    const debouncedOnChange = useMemo(
      () => createDebouncedFunction({ func: onChange, timeoutRef, debounce }),
      [debounce, onChange],
    );

    const validate = () => {
      const filled =
        value != null || (inputRef.current?.value?.trim().length ?? 0) > 0;
      setIsValid(filled);
      if (required) {
        onRequiredCheck?.(filled);
      }
      return filled;
    };

    const handleValueChange = (
      nextValue: number | null,
      eventDetails: BaseNumberField.Root.ChangeEventDetails,
    ) => {
      setOptimisticValue(nextValue);
      if (required) {
        validate();
      }
      const isStepperPress =
        eventDetails.reason === "increment-press" ||
        eventDetails.reason === "decrement-press";
      if (isStepperPress) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        onChange?.(nextValue);
        return;
      }
      debouncedOnChange?.(nextValue);
    };

    useEffect(() => {
      setOptimisticValue(value ?? null);
    }, [value]);

    const showError = (required && !isValid) || !!error;
    const resolvedHelperText =
      showError ? errorMessage
      : minValue != null || maxValue != null ?
        `Digite um valor entre ${minValue} e ${maxValue}`
      : helperText;
    const formControlSx = [
      {
        mt: "4px",
        mb: 0,
        "& .MuiInputBase-sizeSmall .MuiOutlinedInput-input": {
          paddingTop: label ? "12px" : "6px",
          paddingBottom: label ? "0px" : "6px",
        },
        "& .MuiInputLabel-root": {
          pr: "32px",
        },
      },
      ...(readOnly ? [readOnlyTextFieldSx] : []),
      ...(Array.isArray(sx) ? sx
      : sx ? [sx]
      : []),
    ];
    const field = (
      <BaseNumberField.Root
        id={id}
        name={name}
        value={optimisticValue}
        defaultValue={defaultValue ?? undefined}
        min={minValue}
        max={maxValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        inputRef={inputRef}
        onValueChange={handleValueChange}
        render={(rootProps) => (
          <FormControl
            ref={rootProps.ref}
            className={className}
            fullWidth={fullWidth}
            margin={margin}
            size={size}
            required={required}
            disabled={disabled || readOnly}
            error={showError}
            variant={variant}
            sx={formControlSx}
          >
            {rootProps.children}
          </FormControl>
        )}
      >
        {label ?
          <InputLabel htmlFor={id} shrink>
            {label}
          </InputLabel>
        : null}
        <BaseNumberField.Input
          id={id}
          render={(inputProps, state) => (
            <OutlinedInput
              autoFocus={autoFocus}
              placeholder={placeholder}
              label={label}
              disabled={disabled || readOnly}
              inputRef={(node) => {
                inputRef.current = node;
                assignRef(inputProps.ref, node);
                assignRef(ref, node);
              }}
              value={state.inputValue}
              onFocus={inputProps.onFocus}
              onKeyDown={inputProps.onKeyDown}
              onKeyUp={inputProps.onKeyUp}
              onChange={inputProps.onChange}
              onBlur={(event) => {
                inputProps.onBlur?.(event);
                if (required) {
                  validate();
                }
                onBlur?.(event);
              }}
              slotProps={{
                input: {
                  ...inputProps,
                },
              }}
              startAdornment={
                startAdornment ?
                  <InputAdornment position="start">
                    {startAdornment}
                  </InputAdornment>
                : undefined
              }
              endAdornment={
                <InputAdornment position="end">
                  <div className="flex items-center gap-1">
                    <div className={alignEndAdornmentWithText ? "mt-4" : ""}>
                      {endAdornment}
                    </div>
                    {!disabled && !readOnly ?
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0,
                        }}
                      >
                        <BaseNumberField.Increment
                          render={
                            <IconButton
                              size="small"
                              style={{ padding: 0, height: 18 }}
                            />
                          }
                        >
                          <IconChevronUp className="h-4" />
                        </BaseNumberField.Increment>
                        <BaseNumberField.Decrement
                          render={
                            <IconButton
                              size="small"
                              style={{ padding: 0, height: 18 }}
                            />
                          }
                        >
                          <IconChevronDown className="h-4" />
                        </BaseNumberField.Decrement>
                      </div>
                    : null}
                  </div>
                </InputAdornment>
              }
            />
          )}
        />
        <FormHelperText>{resolvedHelperText}</FormHelperText>
      </BaseNumberField.Root>
    );
    const wrappedField = (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: label ? "8px" : "0px",
          width: fullWidth ? "100%" : undefined,
        }}
      >
        {tooltip ?
          <Tooltip title={tooltip} enterTouchDelay={0}>
            <Box
              sx={{
                display: "block",
                width: fullWidth ? "100%" : undefined,
              }}
            >
              {field}
            </Box>
          </Tooltip>
        : field}
      </Box>
    );

    return wrappedField;
  },
);

CNumberField.displayName = "CNumberField";

export default CNumberField;
