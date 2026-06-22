import {
  MobileTimePicker,
  MobileTimePickerProps,
  PickerChangeHandlerContext,
  TimeValidationError,
} from "@mui/x-date-pickers";
import { PickerValue } from "@mui/x-date-pickers/internals";
import dayjs from "dayjs";
import React, { useCallback } from "react";

type CTimePickerProps = MobileTimePickerProps & {
  error?: boolean;
  helperText?: string;
  debounce?: number;
  clearable?: boolean;
};

const CTimePicker = React.forwardRef<HTMLInputElement, CTimePickerProps>(
  (props, ref) => {
    const {
      value,
      debounce,
      clearable,
      helperText,
      onAccept,
      onChange,
      ...rest
    } = props;

    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleChange = useCallback(
      (
        newValue: PickerValue,
        context: PickerChangeHandlerContext<TimeValidationError>,
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
        context: PickerChangeHandlerContext<TimeValidationError>,
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
      <MobileTimePicker
        ref={ref}
        value={value}
        onChange={handleChange}
        onAccept={handleAccept}
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

CTimePicker.displayName = "CTimePicker";

export default CTimePicker;
