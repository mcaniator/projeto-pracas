import {
  DateTimeValidationError,
  MobileDateTimePicker,
  MobileDateTimePickerProps,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";

type CDateTimePickerProps = MobileDateTimePickerProps & {
  error?: boolean;
  helperText?: string;
  debounce?: number;
  clearable?: boolean;
};

const CDateTimePicker = React.forwardRef<
  HTMLInputElement,
  CDateTimePickerProps
>((props, ref) => {
  const {
    ampm = false,
    debounce,
    clearable,
    helperText,
    minDate = dayjs("1900-01-01"),
    maxDate = dayjs("2100-12-31"),
    onAccept,
    onChange,
    onError,
    ...rest
  } = props;

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [validationError, setValidationError] =
    useState<DateTimeValidationError | null>(null);

  const handleChange = useCallback(
    (
      newValue: PickerValue,
      context: PickerChangeHandlerContext<DateTimeValidationError>,
    ) => {
      if (!onChange) return;

      if (!debounce || debounce <= 0) {
        onChange(newValue, context);
        return;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        onChange(newValue, context);
      }, debounce);
    },
    [onChange, debounce],
  );

  const handleAccept = useCallback(
    (
      newValue: PickerValue,
      context: PickerChangeHandlerContext<DateTimeValidationError>,
    ) => {
      if (!onAccept) return;

      if (!debounce || debounce <= 0) {
        onAccept(newValue, context);
        return;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        onAccept(newValue, context);
      }, debounce);
    },
    [onAccept, debounce],
  );

  const handleError = useCallback(
    (error: DateTimeValidationError, value: PickerValue) => {
      setValidationError(error);
      onError?.(error, value);
    },
    [onError],
  );
  //This is a workaround for field showing error when validation error is "minDate" or "maxDate". Increasing date range will fix the issue, but impact on performance during value picking.
  const shouldShowValidationError =
    validationError !== null &&
    validationError !== "minDate" &&
    validationError !== "maxDate";
  const shouldShowError = props.error || shouldShowValidationError;

  const fieldsetSx =
    shouldShowError ?
      {
        borderColor: "error.main",
      }
    : {};
  const labelSx =
    shouldShowError ?
      {
        color: "error.main",
      }
    : {};
  return (
    <MobileDateTimePicker
      ref={ref}
      ampm={ampm}
      onChange={handleChange}
      onAccept={handleAccept}
      onError={handleError}
      minDate={minDate}
      maxDate={maxDate}
      slotProps={{
        field: {
          clearable: clearable,
        },
        textField: {
          error: shouldShowError,
          helperText: helperText,
          InputLabelProps: { shrink: true },
          sx: {
            mt: "8px",
            "& .MuiPickersOutlinedInput-root": {
              borderRadius: 6,
              "& fieldset": fieldsetSx,
              fontSize: 16,
              "@media (min-width:680px)": {
                fontSize: 20,
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "primary.main",
            },
            "& .MuiInputLabel-root": labelSx,
            "& fieldset legend": {
              display: "none",
            },
            "& fieldset": {
              backgroundColor: "white",
            },
            "& .MuiPickersSectionList-root": {
              zIndex: 1,
              pt: "12px",
              pb: "0px",
            },
            "& .MuiInputAdornment-root": {
              zIndex: 1,
            },
            "& .MuiPickersInputBase-root": {
              borderRadius: "16px",
            },
          },
        },
      }}
      {...rest}
    />
  );
});

CDateTimePicker.displayName = "CDateTimePicker";

export default CDateTimePicker;
