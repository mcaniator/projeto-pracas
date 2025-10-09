import { useActionState, useEffect } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";
import { _subcategorySubmit } from "../../../../../../lib/serverFunctions/serverActions/categoryServerActions";

const SubcategoryCreationDialog = ({
  categoryId,
  categoryName,
  open,
  onClose,
  reloadCategories,
}: {
  categoryId: number;
  categoryName: string;
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
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
      title="Criar subcategoria"
      open={open}
      onClose={onClose}
      isForm
      action={formAction}
      confirmChildren={<>Criar</>}
    >
      <div className="flex flex-col gap-1">
        <h6 className="text-base font-semibold">
          Categoria pai: {categoryName}
        </h6>
        <input
          type="hidden"
          id="category-id"
          name="category-id"
          value={categoryId}
        />
        <CTextField
          required
          resetOnFormSubmit
          id="subcategory-name"
          name="subcategory-name"
          label="Nome"
        />
        <CTextField
          resetOnFormSubmit
          id="notes"
          name="notes"
          label="Observações"
        />
      </div>
    </CDialog>
  );
};

export default SubcategoryCreationDialog;
