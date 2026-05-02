import CCheckboxGroup from "@/components/ui/cCheckboxGroup";
import CRadioGroup from "@/components/ui/cRadioGroup";
import { localeNumberFormatter } from "@/lib/formatters/numberFormatters";
import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import { useMemo } from "react";
import type { ResponseQuestionValue } from "./responseFormTypes";

const OptionsResponseQuestionField = ({
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
  if (!question.options) {
    throw new Error("Options questions must have options");
  }

  const isPercentage = question.characterType === "PERCENTAGE";
  const options = useMemo(() => {
    if (
      question.characterType === "PERCENTAGE" ||
      question.characterType === "NUMBER"
    ) {
      return (
        question.options?.map((opt) => ({
          ...opt,
          text:
            isPercentage ?
              localeNumberFormatter.format(Number(opt.text)) + "%"
            : opt.text,
        })) || []
      );
    }

    return question.options || [];
  }, [question.options, isPercentage, question.characterType]);

  if (question.optionType === "CHECKBOX") {
    return (
      <CCheckboxGroup
        value={Array.isArray(value) ? value : ([] as number[])}
        clearable
        readOnly={readOnly}
        options={options}
        getOptionValue={(opt) => opt.id}
        getOptionLabel={(opt) => opt.text}
        onChange={onChange}
      />
    );
  }

  return (
    <CRadioGroup
      value={
        typeof value === "number" || typeof value === "string" ?
          Number(value)
        : null
      }
      clearable
      readOnly={readOnly}
      onChange={onChange}
      options={options}
      getOptionValue={(opt) => opt.id}
      getOptionLabel={(opt) => opt.text}
    />
  );
};

export default OptionsResponseQuestionField;
