import COverridableCheckboxGroup from "@/components/ui/cOverridableCheckboxGroup";
import COverridableRadioGroup from "@/components/ui/cOverridableRadioGroup";
import { localeNumberFormatter } from "@/lib/formatters/numberFormatters";
import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import {
  type FormSubmissionOptionValueWithOverride,
  type ResponseQuestionValue,
  isFormSubmissionOptionValueWithOverride,
  isFormSubmissionOptionValueWithOverrideArray,
} from "@/lib/types/formSubmission/responseFormTypes";
import { useMemo } from "react";

const OptionsResponseQuestionField = ({
  question,
  value,
  readOnly,
  onChange,
}: {
  question: FormSubmissionQuestionItem;
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
      question.characterType !== "PERCENTAGE" &&
      question.characterType !== "NUMBER"
    ) {
      return question.options || [];
    }

    return (question.options || []).map((opt) => ({
      ...opt,
      text:
        isPercentage ?
          localeNumberFormatter.format(Number(opt.text)) + "%"
        : opt.text,
    }));
  }, [question.options, isPercentage, question.characterType]);

  const selectedValues: FormSubmissionOptionValueWithOverride[] =
    isFormSubmissionOptionValueWithOverrideArray(value) ? value : [];
  const selectedValue: FormSubmissionOptionValueWithOverride | null =
    isFormSubmissionOptionValueWithOverride(value) ? value : null;

  if (question.optionType === "CHECKBOX") {
    return (
      <COverridableCheckboxGroup
        value={selectedValues}
        overrideType={"TEXT"}
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
    <COverridableRadioGroup
      value={selectedValue}
      overrideType={"TEXT"}
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
