import { DateTimePicker, DateTimePickerProps } from "@mui/x-date-pickers";
import React from "react";

type CDateTimePickerProps = DateTimePickerProps;

const CDateTimePicker = React.forwardRef<
  HTMLInputElement,
  CDateTimePickerProps
>((props, ref) => {
  const { ampm = false, ...rest } = props;
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
