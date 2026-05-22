import CDatePicker from "@/components/ui/cDatePicker";
import CNumberField from "@/components/ui/cNumberField";
import CTextField from "@/components/ui/cTextField";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import dayjs from "dayjs";

import type { ResponseQuestionValue } from "./responseFormTypes";

const WrittenResponseQuestionField = ({
  question,
  value,
  readOnly,
  disableDebouce = false,
  onChange,
}: {
  question: AssessmentQuestionItem;
  value: ResponseQuestionValue;
  readOnly: boolean;
  disableDebouce?: boolean;
  onChange: (value: ResponseQuestionValue) => void;
}) => {
  const debounce = disableDebouce ? 0 : 1000;
  switch (question.characterType) {
    case "TEXT":
      return (
        <CTextField
          clearable
          readOnly={readOnly}
          debounce={debounce}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      );
    case "NUMBER":
    case "PERCENTAGE":
    case "SCALE":
      return (
        <CNumberField
          clearable
          readOnly={readOnly}
          debounce={debounce}
          minValue={question.scaleConfig?.minValue ?? undefined}
          maxValue={question.scaleConfig?.maxValue ?? undefined}
          endAdornment={
            question.characterType === "PERCENTAGE" ? "%" : undefined
          }
          value={typeof value === "number" || value === null ? value : null}
          onChange={(nextValue) => {
            onChange(nextValue);
          }}
        />
      );
    case "DATE":
      return (
        <CDatePicker
          clearable
          readOnly={readOnly}
          debounce={debounce}
          value={dayjs.isDayjs(value) ? value : null}
          onChange={(nextValue) => {
            if (nextValue === null) {
              onChange(dayjs(""));
            } else {
              onChange(nextValue);
            }
          }}
        />
      );
  }
};

export default WrittenResponseQuestionField;
