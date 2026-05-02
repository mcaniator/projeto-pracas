import type { AssessmentQuestionItem } from "@/lib/serverFunctions/queries/assessment";
import BooleanResponseQuestionField from "./booleanResponseQuestionField";
import OptionsResponseQuestionField from "./optionsResponseQuestionField";
import type { ResponseQuestionValue } from "./responseFormTypes";
import WrittenResponseQuestionField from "./writtenResponseQuestionField";

const ResponseQuestionFieldRenderer = ({
  question,
  value,
  readOnly = false,
  disableDebouce = false,
  onChange,
}: {
  question: AssessmentQuestionItem;
  value: ResponseQuestionValue;
  readOnly?: boolean;
  disableDebouce?: boolean;
  onChange: (value: ResponseQuestionValue) => void;
}) => {
  if (question.questionType === "WRITTEN") {
    return (
      <WrittenResponseQuestionField
        question={question}
        value={value}
        readOnly={readOnly}
        disableDebouce={disableDebouce}
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
