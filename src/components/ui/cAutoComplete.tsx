import { IconButton, IconButtonOwnProps, InputAdornment } from "@mui/material";
import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import React from "react";

import { readOnlyTextFieldSx } from "../../lib/theme/customSx";
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
  name?: string;
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
    name,
    onAppendIconButtonClick,
    ...rest
  } = props;
  const readOnlySx = readOnly ? readOnlyTextFieldSx : undefined;

  const handleAppendIconButtonClick = () => {
    if (onAppendIconButtonClick) {
      onAppendIconButtonClick();
    }
  };

  return (
    <>
      {!!name && name.length > 0 && (
        <input type="hidden" value={value ? String(value) : ""} />
      )}

      <Autocomplete
        key={!value ? "uncontrolled" : "controlled"}
        value={value}
        {...rest}
        renderOption={(
          props,
          option,
          { index }, //By default, Autocomplete uses the option label to generate the option  key. This can lead to render errors in case there are options with the same label. This workaorund in renderOptions aims to fix this.
        ) => (
          <li {...props} key={index}>
            {rest.getOptionLabel ? rest.getOptionLabel(option) : String(option)}
          </li>
        )}
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
    </>
  );
}

export default CAutocomplete;
