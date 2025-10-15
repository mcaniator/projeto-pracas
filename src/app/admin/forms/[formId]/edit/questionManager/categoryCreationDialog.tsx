import { useHelperCard } from "@components/context/helperCardContext";
import { useLoadingOverlay } from "@components/context/loadingContext";
import CTextField from "@components/ui/cTextField";
import CDialog from "@components/ui/dialog/cDialog";
import { _categorySubmit } from "@serverActions/categoryServerActions";
import { useActionState, useEffect } from "react";

const CategoryCreationDialog = ({
  open,
  categoryId,
  categoryName,
  notes,
  onClose,
  reloadCategories,
  openCategoryDeletionDialog,
}: {
  open: boolean;
  categoryId?: number;
  categoryName?: string;
  notes?: string;
  onClose: () => void;
  reloadCategories: () => void;
  openCategoryDeletionDialog: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const initialState = {
    responseInfo: { statusCode: 0 },
    categoryName: null,
  };
  const [state, formAction, isPending] = useActionState(
    _categorySubmit,
    initialState,
  );

  useEffect(() => {
    helperCardProcessResponse(state.responseInfo);
    if (state.responseInfo.statusCode === 201) {
      reloadCategories();
    }
  }, [state, helperCardProcessResponse, reloadCategories]);

  useEffect(() => {
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Salvando categoria..." });
    } else {
      setLoadingOverlay({ show: false });
    }
  }, [isPending, setLoadingOverlay]);
  return (
    <CDialog
      isForm
      action={formAction}
      title={categoryId ? "Editar categoria" : "Criar categoria"}
      open={open}
      onClose={onClose}
      onCancel={openCategoryDeletionDialog}
      confirmChildren={categoryId ? <>Editar</> : <>Criar</>}
      cancelChildren={categoryId ? <>Excluir</> : undefined}
      cancelColor="error"
    >
      <div className="flex flex-col">
        {categoryId && (
          <>
            <div>
              Atenção: editar esta categoria acarretará mudanças em todos os
              formulários em que ela está presente!
            </div>
            <input
              type="hidden"
              name="categoryId"
              id="categoryId"
              value={categoryId}
            />
          </>
        )}

        <CTextField
          required
          resetOnFormSubmit
          defaultValue={categoryName}
          id="name"
          name="name"
          label="Nome"
        />
        <CTextField
          resetOnFormSubmit
          defaultValue={notes}
          id="notes"
          name="notes"
          label="Observações"
        />
      </div>
    </CDialog>
  );
};

export default CategoryCreationDialog;
