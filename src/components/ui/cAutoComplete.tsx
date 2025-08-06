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
  mapValue?: boolean;
  optionValue?: string;
  optionLabel?: string;
};

const CAutocomplete = React.forwardRef(
  <
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false,
  >(
    props: CAutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const { label, ...rest } = props;

    return (
      <div className="flex items-center">
        <Autocomplete
          ref={ref}
          {...rest}
          renderInput={(params) => <CTextField {...params} label={label} />}
        />
      </div>
    );
  },
);

CAutocomplete.displayName = "CAutocomplete";
export default CAutocomplete;
