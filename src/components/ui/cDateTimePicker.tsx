import { DateTimePicker, DateTimePickerProps } from "@mui/x-date-pickers";
import React from "react";

type CDateTimePickerProps = DateTimePickerProps & {
  error?: boolean;
};

const CDateTimePicker = React.forwardRef<
  HTMLInputElement,
  CDateTimePickerProps
>((props, ref) => {
  const { ampm = false, ...rest } = props;
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
    <DateTimePicker
      ref={ref}
      ampm={ampm}
      slotProps={{
        textField: {
          sx: {
            "& .MuiPickersOutlinedInput-root": {
              borderRadius: 6,
              fontSize: 20,
              "& fieldset": fieldsetSx,
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "primary.main",
            },
            "& .MuiInputLabel-root": labelSx,
          },
        },
      }}
      {...rest}
    />
  );
});

CDateTimePicker.displayName = "CDateTimePicker";

export default CDateTimePicker;
