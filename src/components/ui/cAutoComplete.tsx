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
};

function CAutocomplete<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>(props: CAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
  const { label, readOnly, sx, ...rest } = props;
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
  return (
    <Autocomplete
      {...rest}
      renderInput={(params) => (
        <CTextField
          {...params}
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
          sx={{ ...sx, ...readOnlySx }}
          label={label}
        />
      )}
    />
  );
}

export default CAutocomplete;
