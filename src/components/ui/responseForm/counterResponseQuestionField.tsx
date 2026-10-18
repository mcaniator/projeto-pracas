import CCounterButtons from "@/components/ui/cCounterButtons";
import CDynamicIcon from "@/components/ui/dynamicIcon/cDynamicIcon";
import { FormSubmissionQuestionItem } from "@/lib/serverFunctions/queries/formSubmission";
import type { ResponseQuestionValue } from "@/lib/types/formSubmission/responseFormTypes";
import { enqueueSnackbar } from "notistack";

const CounterResponseQuestionField = ({
  value,
  readOnly,
  question,
  onChange,
}: {
  value: ResponseQuestionValue;
  readOnly: boolean;
  question: FormSubmissionQuestionItem;
  onChange: (value: ResponseQuestionValue) => void;
}) => {
  const count = typeof value === "number" && Number.isFinite(value) ? value : 0;

  const notifyChange = (added: boolean) => {
    enqueueSnackbar({
      anchorOrigin: { vertical: "top", horizontal: "center" },
      autoHideDuration: 3000,
      variant: "node",
      preventDuplicate: false,
      backgroundColor: added ? "#43a047" : "#d32f2f",
      node: (
        <div className="flex items-center gap-2">
          <span>{added ? "+ 1" : "- 1"}</span>

          <CDynamicIcon iconKey={question.iconKey} />
        </div>
      ),
    });
  };

  return (
    <CCounterButtons
      count={count}
      readOnly={readOnly}
      onIncrement={() => {
        onChange(count + 1);
        notifyChange(true);
      }}
      onDecrement={() => {
        onChange(Math.max(0, count - 1));
        notifyChange(false);
      }}
    />
  );
};

export default CounterResponseQuestionField;
