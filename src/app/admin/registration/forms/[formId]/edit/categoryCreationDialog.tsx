import { useActionState, useEffect } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";
import { _categorySubmit } from "../../../../../../lib/serverFunctions/serverActions/categoryServerActions";

const CategoryCreationDialog = ({
  open,
  onClose,
  reloadCategories,
}: {
  open: boolean;
  onClose: () => void;
  reloadCategories: () => void;
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
      title="Criar categoria"
      open={open}
      onClose={onClose}
      confirmChildren={<>Criar</>}
    >
      <div className="flex flex-col">
        <CTextField
          required
          resetOnFormSubmit
          id="name"
          name="name"
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

export default CategoryCreationDialog;
