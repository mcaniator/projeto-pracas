import type { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import type { ResponseQuestionValue } from "@/lib/types/formSubmission/responseFormTypes";

import BooleanResponseQuestionField from "./booleanResponseQuestionField";
import OptionsResponseQuestionField from "./optionsResponseQuestionField";
import WrittenResponseQuestionField from "./writtenResponseQuestionField";

const ResponseQuestionFieldRenderer = ({
  question,
  value,
  readOnly = false,
  onChange,
}: {
  question: FormSubmissionQuestionItem;
  value: ResponseQuestionValue;
  readOnly?: boolean;
  onChange: (value: ResponseQuestionValue) => void;
}) => {
  if (question.questionType === "WRITTEN") {
    return (
      <WrittenResponseQuestionField
        question={question}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
      />
    );
  }

  if (question.questionType === "OPTIONS") {
    return (
      <OptionsResponseQuestionField
        question={question}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
      />
    );
  }

  if (question.questionType === "BOOLEAN") {
    return (
      <BooleanResponseQuestionField
        value={value}
        readOnly={readOnly}
        onChange={onChange}
      />
    );
  }

  return null;
};

export default ResponseQuestionFieldRenderer;
