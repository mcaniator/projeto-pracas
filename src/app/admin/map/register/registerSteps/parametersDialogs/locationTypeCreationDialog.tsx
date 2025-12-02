"use client";

import { _saveLocationType } from "@/lib/serverFunctions/serverActions/locationType";
import { useActionState, useEffect } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";

const LocationTypeCreationDialog = ({
  open,
  selectedType,
  onClose,
  reloadTypes,
}: {
  open: boolean;
  selectedType: {
    id: number;
    name: string;
  } | null;
  onClose: () => void;
  reloadTypes: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [state, formAction, isPending] = useActionState(_saveLocationType, {
    responseInfo: { statusCode: 0 },
  });
  useEffect(() => {
    helperCardProcessResponse(state.responseInfo);
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Salvando tipo..." });
    } else {
      setLoadingOverlay({ show: false });
    }
    if (state.responseInfo.statusCode === 201) {
      reloadTypes();
    }
  }, [
    isPending,
    state,
    helperCardProcessResponse,
    reloadTypes,
    setLoadingOverlay,
  ]);

  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      title={selectedType ? "Editar tipo" : "Criar tipo"}
      confirmChildren={selectedType ? "Editar" : "Criar"}
      cancelChildren={selectedType ? "Excluir" : undefined}
      cancelColor="error"
    >
      <input
        type="hidden"
        name="typeId"
        value={selectedType?.id ?? undefined}
      />
      <CTextField
        defaultValue={selectedType ? selectedType.name : ""}
        resetOnFormSubmit
        required
        maxCharacters={255}
        label="Nome"
        name="name"
      />
    </CDialog>
  );
};

export default LocationTypeCreationDialog;
