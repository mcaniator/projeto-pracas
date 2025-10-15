import CTextField from "@components/ui/cTextField";
import CDialog from "@components/ui/dialog/cDialog";
import { useHelperCard } from "@context/helperCardContext";
import { useLoadingOverlay } from "@context/loadingContext";
import { _subcategorySubmit } from "@serverActions/categoryServerActions";
import { useActionState, useEffect } from "react";

const SubcategoryCreationDialog = ({
  categoryId,
  categoryName,
  subcategoryId,
  subcategoryName,
  notes,
  open,
  onClose,
  reloadCategories,
  openSubcategoryDeletionDialog,
}: {
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  notes?: string;
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
  openSubcategoryDeletionDialog: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const initialState = {
    responseInfo: {
      statusCode: 0,
      message: "",
    },
    subcategoryName: null,
  };
  const [state, formAction, isPending] = useActionState(
    _subcategorySubmit,
    initialState,
  );

  useEffect(() => {
    helperCardProcessResponse(state?.responseInfo);
    if (state?.responseInfo.statusCode === 201) {
      reloadCategories();
    }
  }, [state, helperCardProcessResponse, reloadCategories]);

  useEffect(() => {
    setLoadingOverlay({ show: isPending, message: "Criando subcategoria..." });
  }, [isPending, setLoadingOverlay]);
  return (
    <CDialog
      title={subcategoryId ? "Editar subcategoria" : "Criar subcategoria"}
      open={open}
      onClose={onClose}
      isForm
      action={formAction}
      onCancel={openSubcategoryDeletionDialog}
      confirmChildren={subcategoryId ? <>Editar</> : <>Criar</>}
      cancelChildren={subcategoryId ? <>Excluir</> : undefined}
      cancelColor="error"
    >
      <div className="flex flex-col gap-1">
        <h6 className="text-base font-semibold">
          Categoria pai: {categoryName}
        </h6>
        {subcategoryId && (
          <>
            <div>
              Atenção: editar esta subcategoria acarretará mudanças em todos os
              formulários em que ela está presente!
            </div>
            <input
              type="hidden"
              name="subcategoryId"
              id="subcategoryId"
              value={subcategoryId}
            />
          </>
        )}
        <input
          type="hidden"
          id="category-id"
          name="category-id"
          value={categoryId}
        />
        <CTextField
          required
          resetOnFormSubmit
          defaultValue={subcategoryName}
          id="subcategory-name"
          name="subcategory-name"
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

export default SubcategoryCreationDialog;
