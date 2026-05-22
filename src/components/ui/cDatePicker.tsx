import {
  DateValidationError,
  MobileDatePicker,
  MobileDatePickerProps,
  PickerChangeHandlerContext,
} from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs from "dayjs";
import React, { useCallback } from "react";

type CDatePickerProps = MobileDatePickerProps & {
  error?: boolean;
  helperText?: string;
  debounce?: number;
  clearable?: boolean;
};

const CDatePicker = React.forwardRef<HTMLInputElement, CDatePickerProps>(
  (props, ref) => {
    const {
      value,
      debounce,
      clearable,
      helperText,
      minDate = dayjs("0100-01-01"),
      maxDate = dayjs("9999-12-31"),
      onAccept,
      onChange,
      ...rest
    } = props;

    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleChange = useCallback(
      (
        newValue: PickerValue,
        context: PickerChangeHandlerContext<DateValidationError>,
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

    const handleBlur = useCallback(() => {
      if (!dayjs(value).isValid()) {
        onChange?.(null, { validationError: null });
      }
    }, [value, onChange]);

    const handleAccept = useCallback(
      (
        newValue: PickerValue,
        context: PickerChangeHandlerContext<DateValidationError>,
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

    const fieldsetSx =
      props.error ?
        {
          borderColor: "error.main",
        }
      : {};
    const labelSx =
      props.error ?
        {
          color: "error.main",
        }
      : {};
    return (
      <MobileDatePicker
        ref={ref}
        value={value}
        onChange={handleChange}
        onAccept={handleAccept}
        minDate={minDate}
        maxDate={maxDate}
        slotProps={{
          field: {
            clearable: clearable,
          },
          textField: {
            helperText: helperText,
            InputLabelProps: { shrink: true },
            onBlur: handleBlur,
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
  },
);

CDatePicker.displayName = "CDatePicker";

export default CDatePicker;
