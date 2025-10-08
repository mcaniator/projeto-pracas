import { IconButton, IconButtonOwnProps, InputAdornment } from "@mui/material";
import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import React from "react";

import CTextField from "./cTextField";

type CAutocompleteProps<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> = Omit<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  "renderInput"
> & {
  label?: string;
  value?: string | number | T | null;
  options: T[];
  appendIconButton?: React.ReactNode;
  appendIconButtonSx?: IconButtonOwnProps["sx"];
  disableAppendIconButton?: boolean;
  placeholder?: string;
  onAppendIconButtonClick?: () => void;
};

function CAutocomplete<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>(props: CAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  const {
    label,
    readOnly,
    sx,
    value,
    appendIconButton,
    disableAppendIconButton,
    appendIconButtonSx,
    placeholder,
    onAppendIconButtonClick,
    ...rest
  } = props;
  const readOnlySx =
    readOnly ?
      {
        "& .MuiOutlinedInput-notchedOutline": {
          borderStyle: "dashed",
          borderColor: "gray",
          borderWidth: "2px",
        },
      }
    : undefined;

  const handleAppendIconButtonClick = () => {
    if (onAppendIconButtonClick) {
      onAppendIconButtonClick();
    }
  };

  return (
    <Autocomplete
      key={!value ? "uncontrolled" : "controlled"}
      value={value}
      {...rest}
      renderInput={(params) => (
        <CTextField
          {...params}
          isAutocompleteInput
          placeholder={placeholder}
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                {appendIconButton && (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{
                        padding: "0px 8px",
                        color: disableAppendIconButton ? "gray" : "inherit",
                        ...appendIconButtonSx,
                      }}
                      disabled={disableAppendIconButton}
                      edge="end"
                      onClick={handleAppendIconButtonClick}
                    >
                      {appendIconButton}
                    </IconButton>
                  </InputAdornment>
                )}
              </>
            ),
          }}
          sx={{ ...sx, ...readOnlySx }}
          label={label}
        />
      )}
    />
  );
}

export default CAutocomplete;
