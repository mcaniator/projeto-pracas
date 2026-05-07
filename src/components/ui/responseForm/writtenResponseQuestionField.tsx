import CNumberField from "@/components/ui/cNumberField";
import CTextField from "@/components/ui/cTextField";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
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

  return (
      question.characterType === "NUMBER" ||
        question.characterType === "PERCENTAGE" ||
        question.characterType === "SCALE"
    ) ?
      <CNumberField
        readOnly={readOnly}
        debounce={debounce}
        minValue={question.scaleConfig?.minValue ?? undefined}
        maxValue={question.scaleConfig?.maxValue ?? undefined}
        endAdornment={question.characterType === "PERCENTAGE" ? "%" : undefined}
        value={typeof value === "number" || value === null ? value : null}
        onChange={(nextValue) => {
          onChange(nextValue);
        }}
      />
    : <CTextField
        readOnly={readOnly}
        debounce={debounce}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />;
};

export default WrittenResponseQuestionField;
