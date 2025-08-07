import Autocomplete, {
  AutocompleteProps,
  AutocompleteValue,
} from "@mui/material/Autocomplete";
import React, { useCallback, useEffect, useState } from "react";

import CTextField from "./cTextField";

type CAutocompleteProps<
  T,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
> = Omit<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  "renderInput" | "onChange"
> & {
  label?: string;
  name?: string;
  optionValue?: string;
  optionLabel?: string;
  mapValue?: boolean;
  required?: boolean;
  validateOnMount?: boolean;
  errorMessage?: string;
  onChange?: (value: string | number | T | null) => void;
  onRequiredCheck?: (valid: boolean) => void;
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
    const {
      label,
      mapValue = false,
      optionLabel = "label",
      optionValue = "value",
      validateOnMount = false,
      errorMessage,
      onChange,
      onRequiredCheck,
      ...rest
    } = props;

    const [hiddenValue, setHiddenValue] = useState<string | number | T | null>(
      null,
    );

    const [valid, setValid] = useState<boolean>(false);

    const validate = useCallback(() => {
      const valid =
        props.required ? hiddenValue != null && hiddenValue !== "" : true;
      if (onRequiredCheck) {
        onRequiredCheck(valid);
      }
      setValid(valid);
      return valid;
    }, [props.required, hiddenValue, onRequiredCheck]);

    const handleChange = (
      event: React.SyntheticEvent,
      value: AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>,
    ) => {
      let mappedValue: string | number | T | null = null;
      if (mapValue && value) {
        if (typeof value === "object" && value !== null) {
          const v = (value as Record<string, T>)[optionValue];
          mappedValue = v !== undefined ? v : null;
        } else {
          throw new Error("Value is not an object");
        }
        if (onChange) {
          onChange(mappedValue);
        }
      } else {
        mappedValue = value as string | number | T | null;
      }

      setHiddenValue(mappedValue);

      if (onChange) {
        onChange(mappedValue);
      }
    };

    useEffect(() => {
      if (validateOnMount) {
        validate();
      }
    }, [validateOnMount, validate]);

    return (
      <div className={`items-cente flex`}>
        <input
          type="hidden"
          name={props.name}
          id={props.id}
          value={String(hiddenValue) ?? ""}
        />
        <Autocomplete
          ref={ref}
          onChange={handleChange}
          getOptionLabel={(option) =>
            optionLabel ?
              ((option as Record<string, string>)[optionLabel] ?? "")
            : String(option)
          }
          {...rest}
          renderInput={(params) => (
            <CTextField
              {...params}
              error={!valid}
              errorMessage={errorMessage}
              label={label}
            />
          )}
        />
      </div>
    );
  },
);

CAutocomplete.displayName = "CAutocomplete";
export default CAutocomplete;
