import { useDeleteQuestion } from "@/lib/serverFunctions/apiCalls/question";
import CDialog from "@components/ui/dialog/cDialog";
import { useLoadingOverlay } from "@context/loadingContext";
import { FormEventHandler, useEffect, useState } from "react";

//TODO: Use type from server
type ConflictForm = {
  name: string;
};

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
  const [showConflictInfo, setShowConflictInfo] = useState(false);
  const [conflictForms, setConflictForms] = useState<ConflictForm[]>([]);
  const { setLoadingOverlay } = useLoadingOverlay();
  const [deleteQuestion, isPending] = useDeleteQuestion({
    callbacks: {
      onSuccess() {
        handleClose();
        onDeleted();
      },
      onError(response) {
        setShowConflictInfo(true);
        setConflictForms(
          ((response.data as any)?.formsWithQuestions ?? []) as ConflictForm[],
        );
      },
    },
  });

  const handleClose = () => {
    setShowConflictInfo(false);
    setConflictForms([]);
    onClose();
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void deleteQuestion({ data: new FormData(event.currentTarget) });
  };

  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Excluindo questao..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      open={open}
      onClose={handleClose}
      confirmChildren={<>Excluir</>}
      title="Excluir questao"
      subtitle={questionName}
    >
      <div className="flex flex-col gap-1">
        {!showConflictInfo && (
          <h6 className="text-base font-semibold text-red-500">
            Aviso: esta acao excluira esta questao permanentemente!
          </h6>
        )}

        <input
          type="hidden"
          id="questionId"
          name="questionId"
          value={questionId}
        />

        {showConflictInfo && conflictForms.length > 0 && (
          <div className="flex flex-col gap-1">
            <h5 className="text-center text-xl font-semibold text-red-500">
              {`Esta questao esta presente em ${conflictForms.length} formularios:`}
            </h5>
            <ul className="list-inside list-decimal space-y-2 break-words pl-3 font-semibold">
              {conflictForms.map((form, index) => (
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
