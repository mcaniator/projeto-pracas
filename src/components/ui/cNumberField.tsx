import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { TextFieldProps } from "@mui/material/TextField";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { readOnlyTextFieldSx } from "../../lib/theme/customSx";
import { createDebouncedFunction } from "../../lib/utils/ui";

type CNumberFieldSx = Extract<
  NonNullable<SxProps<Theme>>,
  readonly unknown[]
>[number];

type CNumberFieldProps = Omit<TextFieldProps, "onChange" | "sx"> & {
  errorMessage?: string;
  readOnly?: boolean;
  debounce?: number;
  minValue?: number;
  maxValue?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  endAdornmentText?: string;
  alignEndAdornmentWithText?: boolean;
  tooltip?: string;
  defaultValue?: number | null;
  value?: number | null;
  format?: Intl.NumberFormatOptions;
  onRequiredCheck?: (filled: boolean) => void;
  onChange?: (value: number | null) => void;
  sx?: SxProps<Theme>;
};

const assignRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  ref.current = value;
};

const isSxArray = (
  value: SxProps<Theme> | undefined,
): value is readonly CNumberFieldSx[] => {
  return Array.isArray(value);
};

type NumberFieldTextControl = HTMLInputElement | HTMLTextAreaElement;

const setNativeInputValue = (input: NumberFieldTextControl, value: string) => {
  const inputPrototype =
    input instanceof window.HTMLTextAreaElement ?
      window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const valueDescriptor = Object.getOwnPropertyDescriptor(
    inputPrototype,
    "value",
  );

  valueDescriptor?.set?.call(input, value);
};

const getValueWithInsertedText = (
  input: NumberFieldTextControl,
  text: string,
) => {
  const selectionStart = input.selectionStart ?? input.value.length;
  const selectionEnd = input.selectionEnd ?? selectionStart;

  return `${input.value.slice(0, selectionStart)}${text}${input.value.slice(
    selectionEnd,
  )}`;
};

const normalizeNumberFieldInputValue = (value: string) => {
  if (value.includes(",")) {
    return value.replaceAll(".", "");
  }

  return value.replace(".", ",");
};

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
      endAdornmentText,
      tooltip,
      alignEndAdornmentWithText,
      defaultValue,
      debounce = 0,
      format,
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
    const normalizedSx: CNumberFieldSx[] =
      isSxArray(sx) ? [...sx]
      : sx ? [sx]
      : [];
    const formControlSx: SxProps<Theme> = [
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
      ...normalizedSx,
    ];
    const resolvedFormat = useMemo(
      () => ({
        maximumFractionDigits: 20,
        ...format,
      }),
      [format],
    );
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
        format={resolvedFormat}
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
              inputRef={(node: HTMLInputElement | null) => {
                inputRef.current = node;
                assignRef(inputProps.ref, node);
                assignRef(ref, node);
              }}
              value={state.inputValue}
              onFocus={inputProps.onFocus}
              onKeyDown={(event) => {
                if (event.key === ".") {
                  event.preventDefault();

                  const normalizedValue = normalizeNumberFieldInputValue(
                    getValueWithInsertedText(event.currentTarget, event.key),
                  );
                  const caretPosition =
                    event.currentTarget.selectionStart == null ?
                      null
                    : event.currentTarget.selectionStart + 1;

                  if (normalizedValue !== event.currentTarget.value) {
                    setNativeInputValue(event.currentTarget, normalizedValue);
                    event.currentTarget.dispatchEvent(
                      new Event("input", { bubbles: true }),
                    );
                    if (caretPosition != null) {
                      event.currentTarget.setSelectionRange(
                        caretPosition,
                        caretPosition,
                      );
                    }
                  }
                  return;
                }

                inputProps.onKeyDown?.(event);
              }}
              onKeyUp={inputProps.onKeyUp}
              onChange={(event) => {
                const normalizedValue = normalizeNumberFieldInputValue(
                  event.currentTarget.value,
                );
                if (normalizedValue !== event.currentTarget.value) {
                  setNativeInputValue(event.currentTarget, normalizedValue);
                }
                inputProps.onChange?.(event);
              }}
              onBlur={(event) => {
                inputProps.onBlur?.(event);
                if (required) {
                  validate();
                }
                onBlur?.(event);
              }}
              sx={{
                "@media (max-width: 679.95px)": {
                  height: "36px",
                },
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
                      {endAdornmentText ?
                        <Typography
                          component="span"
                          sx={(theme) => ({
                            fontSize: 16,
                            [theme.breakpoints.up("sm")]: {
                              fontSize: 20,
                            },
                          })}
                        >
                          {endAdornmentText}
                        </Typography>
                      : endAdornment}
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
