import CSwitch from "@/components/ui/cSwtich";
import type { ResponseQuestionValue } from "./responseFormTypes";

const BooleanResponseQuestionField = ({
  value,
  readOnly,
  onChange,
}: {
  value: ResponseQuestionValue;
  readOnly: boolean;
  onChange: (value: ResponseQuestionValue) => void;
}) => {
  return (
    <CSwitch
      checked={typeof value === "boolean" ? value : false}
      readOnly={readOnly}
      onChange={(event) => {
        onChange(event.target.checked);
      }}
    />
  );
};

export default BooleanResponseQuestionField;
