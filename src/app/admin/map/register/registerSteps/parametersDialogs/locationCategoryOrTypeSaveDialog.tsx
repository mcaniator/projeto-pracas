"use client";

import { CategoryOrType } from "@/app/admin/map/register/registerSteps/addressStep";
import { _saveLocationCategory } from "@/lib/serverFunctions/serverActions/locationCategory";
import { _saveLocationType } from "@/lib/serverFunctions/serverActions/locationType";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";

import { useHelperCard } from "../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../components/context/loadingContext";
import CTextField from "../../../../../../components/ui/cTextField";
import CDialog from "../../../../../../components/ui/dialog/cDialog";

const LocationCategoryOrTypeSaveDialog = ({
  open,
  selectedItem,
  itemType,
  onClose,
  reloadItems,
  openDeleteDialog,
}: {
  open: boolean;
  selectedItem: {
    id: number;
    name: string;
  } | null;
  itemType: CategoryOrType;
  onClose: () => void;
  reloadItems: () => void;
  openDeleteDialog: () => void;
}) => {
  const { helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const [state, formAction, isPending, resetState] = useResettableActionState(
    itemType === "CATEGORY" ? _saveLocationCategory : _saveLocationType,
    {
      responseInfo: { statusCode: 0 },
    },
  );
  useEffect(() => {
    helperCardProcessResponse(state.responseInfo);
    if (isPending) {
      setLoadingOverlay({ show: true, message: "Salvando..." });
    } else {
      setLoadingOverlay({ show: false });
    }
    if (state.responseInfo.statusCode === 201) {
      reloadItems();
      resetState();
    }
  }, [
    isPending,
    state,
    helperCardProcessResponse,
    reloadItems,
    setLoadingOverlay,
    resetState,
  ]);

  const typeName = itemType === "CATEGORY" ? "Categoria" : "Tipo";

  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      onCancel={openDeleteDialog}
      title={selectedItem ? `Editar ${typeName}` : `Criar ${typeName}`}
      confirmChildren={selectedItem ? "Editar" : "Criar"}
      cancelChildren={selectedItem ? <IconTrash /> : undefined}
      cancelColor="error"
    >
      <input
        type="hidden"
        name="itemId"
        value={selectedItem?.id ?? undefined}
      />
      <CTextField
        defaultValue={selectedItem ? selectedItem.name : ""}
        resetOnFormSubmit={!selectedItem}
        required
        maxCharacters={255}
        label="Nome"
        name="name"
      />
    </CDialog>
  );
};

export default LocationCategoryOrTypeSaveDialog;
