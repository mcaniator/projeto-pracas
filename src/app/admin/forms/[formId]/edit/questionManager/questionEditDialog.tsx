import { useActionState, useEffect } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";
import { _questionUpdate } from "../../../../../../lib/serverFunctions/serverActions/questionUtil";

const QuestionEditDialog = ({
  questionId,
  questionName,
  notes,
  categoryName,
  subcategoryName,
  open,
  onClose,
  reloadCategories,
}: {
  questionId: number;
  questionName: string;
  notes: string | null;
  categoryName: string;
  subcategoryName?: string | null;
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const initialState = {
    responseInfo: { statusCode: 0 },
  };

  const [state, formAction, isPending] = useActionState(
    _questionUpdate,
    initialState,
  );

  useEffect(() => {
    helperCardProcessResponse(state.responseInfo);
    if (state.responseInfo.statusCode === 200) {
      reloadCategories();
    }
  }, [state, helperCardProcessResponse]);

  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Atualizando questão..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);

  return (
    <CDialog
      isForm
      title="Editar questão"
      action={formAction}
      onClose={onClose}
      open={open}
      confirmChildren={<>Editar</>}
    >
      <div className="flex flex-col">
        <div>{`Categoria: ${categoryName}`}</div>
        {subcategoryName && <div>{`Subcategoria: ${subcategoryName}`}</div>}

        <div>
          Atenção: editar esta questão acarretará mudanças em todos os
          formulários em que ela está presente!
        </div>
        <input
          type="hidden"
          name="questionId"
          id="questionId"
          value={questionId}
        />
        <CTextField
          required
          defaultValue={questionName}
          label="Nome"
          id="questionName"
          name="questionName"
        />
        <CTextField
          label="Observações"
          defaultValue={notes}
          id="notes"
          name="notes"
        />
      </div>
    </CDialog>
  );
};

export default QuestionEditDialog;
