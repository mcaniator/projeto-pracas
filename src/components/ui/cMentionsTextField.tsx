import {
  BaseSuggestionData,
  MentionsTextField,
  MentionsTextFieldProps,
} from "@jackstenglein/mui-mentions";
import React from "react";

type CMentionsTextFieldProps<T extends BaseSuggestionData> =
  MentionsTextFieldProps<T> & {
    readOnly?: boolean;
  };

const CMentionsTextField = React.forwardRef<
  HTMLInputElement,
  CMentionsTextFieldProps<BaseSuggestionData>
>((props, ref) => {
  const { sx, readOnly, spellCheck = false, ...rest } = props;
  const readOnlySx =
    readOnly ?
      {
        "& .MuiOutlinedInput-notchedOutline": {
          borderStyle: "dashed",
          borderColor: "gray",
          borderWidth: "2px",
        },
        "& .MuiOutlinedInput-input": {
          cursor: "not-allowed",
        },
      }
    : undefined;

  return (
    <MentionsTextField
      ref={ref}
      aria-disabled
      type="text"
      inputMode="numeric"
      spellCheck={spellCheck}
      InputProps={{ readOnly: readOnly }}
      sx={{ ...sx, ...readOnlySx }}
      {...rest}
    />
  );
});

CMentionsTextField.displayName = "CMentionsTextField";

export default CMentionsTextField;
