import CButton from "@/components/ui/cButton";
import {
  IconButton,
  IconButtonOwnProps,
  InputAdornment,
  Skeleton,
} from "@mui/material";
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
  textFieldName?: string;
  suffixButtonChildren?: React.ReactNode;
  showAppendButtonWhenClear?: boolean;
  error?: boolean;
  onSuffixButtonClick?: () => void;
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
    textFieldName,
    error,
    loading,
    suffixButtonChildren,
    showAppendButtonWhenClear,
    onAppendIconButtonClick,
    onSuffixButtonClick,
    ...rest
  } = props;
  const readOnlySx = readOnly ? readOnlyTextFieldSx : undefined;

  const handleAppendIconButtonClick = () => {
    onAppendIconButtonClick?.();
  };

  const handleSuffixButtonClick = () => {
    onSuffixButtonClick?.();
  };

  const innerComponent = (
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
          error={error}
          isAutocompleteInput
          placeholder={placeholder}
          name={textFieldName}
          InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                {((appendIconButton && showAppendButtonWhenClear) ||
                  (appendIconButton && value)) && (
                  <InputAdornment position="end">
                    <IconButton
                      sx={{
                        padding: "0px 8px 6px 8px",
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

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        sx={{
          width: "100%",
          borderRadius: 4,
          mt: "4px",
          height: {
            xs: 39.5,
            sm: 45.25,
          },
        }}
      />
    );
  } else if (suffixButtonChildren) {
    return (
      <div className="flex w-full items-center justify-center gap-1">
        {!!name && name.length > 0 && (
          <input type="hidden" name={name} value={value ? String(value) : ""} />
        )}

        {innerComponent}
        <CButton
          square
          onClick={handleSuffixButtonClick}
          sx={{
            height: {
              xs: 32.5,
              sm: 39.5,
            },
            width: {
              xs: 32.5,
              sm: 39.5,
            },
          }}
        >
          {suffixButtonChildren}
        </CButton>
      </div>
    );
  } else {
    return (
      <>
        {!!name && name.length > 0 && (
          <input type="hidden" name={name} value={value ? String(value) : ""} />
        )}

        {innerComponent}
      </>
    );
  }
}

export default CAutocomplete;
