import {
  BaseSuggestionData,
  MentionsTextField,
  MentionsTextFieldProps,
} from "@jackstenglein/mui-mentions";
import React from "react";

import { readOnlyTextFieldSx } from "../../lib/theme/customSx";

type CMentionsTextFieldProps<T extends BaseSuggestionData> =
  MentionsTextFieldProps<T> & {
    readOnly?: boolean;
  };

const CMentionsTextField = React.forwardRef<
  HTMLInputElement,
  CMentionsTextFieldProps<BaseSuggestionData>
>((props, ref) => {
  const { sx, readOnly, spellCheck = false, ...rest } = props;
  const readOnlySx = readOnly ? readOnlyTextFieldSx : undefined;

  return (
    <MentionsTextField
      ref={ref}
      type="text"
      spellCheck={spellCheck}
      InputProps={{ readOnly: readOnly }}
      sx={{ ...sx, ...readOnlySx }}
      {...rest}
    />
  );
});

CMentionsTextField.displayName = "CMentionsTextField";

export default CMentionsTextField;
