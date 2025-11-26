"use client";

import { useActionState, useEffect } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";
import { _createLocationCategory } from "../../../../../../lib/serverFunctions/serverActions/locationCategory";

const LocationCategoryCreationDialog = ({
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
  const [state, formAction, isPending] = useActionState(
    _createLocationCategory,
    { responseInfo: { statusCode: 0 } },
  );
  useEffect(() => {
    helperCardProcessResponse(state.responseInfo);
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Salvando categoria..." });
    } else {
      setLoadingOverlay({ show: false });
    }
    if (state.responseInfo.statusCode === 201) {
      reloadCategories();
    }
  }, [
    isPending,
    state,
    helperCardProcessResponse,
    reloadCategories,
    setLoadingOverlay,
  ]);

  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      title="Criar categoria"
      confirmChildren={"Criar"}
    >
      <CTextField
        resetOnFormSubmit
        required
        maxCharacters={255}
        label="Nome"
        name="name"
      />
    </CDialog>
  );
};

export default LocationCategoryCreationDialog;
