import CDatePicker from "@/components/ui/cDatePicker";
import CDateTimePicker from "@/components/ui/cDateTimePicker";
import CNumberField from "@/components/ui/cNumberField";
import CTextField from "@/components/ui/cTextField";
import CTimePicker from "@/components/ui/cTimePicker";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import type { ResponseQuestionValue } from "@/lib/types/assessments/responseFormTypes";
import dayjs from "dayjs";

const WrittenResponseQuestionField = ({
  question,
  value,
  readOnly,
  onChange,
}: {
  question: AssessmentQuestionItem;
  value: ResponseQuestionValue;
  readOnly: boolean;
  onChange: (value: ResponseQuestionValue) => void;
}) => {
  switch (question.characterType) {
    case "TEXT":
      return (
        <CTextField
          clearable
          readOnly={readOnly}
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
          minValue={question.minValue ?? undefined}
          maxValue={question.maxValue ?? undefined}
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
    case "TIME":
      return (
        <CTimePicker
          clearable
          readOnly={readOnly}
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
    case "DATETIME":
      return (
        <CDateTimePicker
          clearable
          readOnly={readOnly}
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
