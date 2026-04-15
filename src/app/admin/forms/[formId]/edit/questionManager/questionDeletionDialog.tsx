import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import CDialog from "@components/ui/dialog/cDialog";
import { useLoadingOverlay } from "@context/loadingContext";
import { _deleteQuestion } from "@lib/serverFunctions/serverActions/questionUtil";
import { useEffect, useState } from "react";

const QuestionDeletionDialog = ({
  questionId,
  questionName,
  open,
  onClose,
  onDeleted,
}: {
  questionId: number;
  questionName: string;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) => {
  const [formAction, isPending, state] = useResettableActionState({
    action: _deleteQuestion,
    callbacks: {
      onSuccess() {
        handleClose();
        onDeleted();
      },
      onError() {
        setShowConflictInfo(true);
      },
    },
  });
  const [showConflictInfo, setShowConflictInfo] = useState(false);
  const { setLoadingOverlay } = useLoadingOverlay();

  const handleClose = () => {
    setShowConflictInfo(false);
    onClose();
  };

  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Excluindo questão..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);

  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={handleClose}
      confirmChildren={<>Excluir</>}
      title="Excluir questao"
      subtitle={questionName}
    >
      <div className="flex flex-col gap-1">
        {!showConflictInfo && (
          <h6 className="text-base font-semibold text-red-500">
            Aviso: esta ação excluirá esta questão permanentemente!
          </h6>
        )}

        <input
          type="hidden"
          id="questionId"
          name="questionId"
          value={questionId}
        />

        {state.responseInfo.statusCode === 409 && showConflictInfo && (
          <div className="flex flex-col gap-1">
            <h5 className="text-center text-xl font-semibold text-red-500">
              {`Esta questão está presente em ${state.data.formsWithQuestions.length} formulários:`}
            </h5>
            <ul className="list-inside list-decimal space-y-2 break-words pl-3 font-semibold">
              {state.data.formsWithQuestions.map((form, index) => (
                <li
                  key={index}
                  className="px-2 outline outline-1 outline-black"
                >
                  {form.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CDialog>
  );
};

export default QuestionDeletionDialog;
