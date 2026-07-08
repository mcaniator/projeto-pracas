"use client";

import { CategoryOrType } from "@/app/admin/map/register/registerSteps/addressStep";
import {
  useSaveLocationCategory,
} from "@/lib/serverFunctions/apiCalls/locationCategory";
import { useSaveLocationType } from "@/lib/serverFunctions/apiCalls/locationType";
import { IconTrash } from "@tabler/icons-react";
import { FormEventHandler } from "react";

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
  const mutationCallbacks = {
    onSuccess() {
      reloadItems();
      onClose();
    },
  };
  const [saveLocationCategory, isSavingCategory] = useSaveLocationCategory({
    callbacks: mutationCallbacks,
  });
  const [saveLocationType, isSavingType] = useSaveLocationType({
    callbacks: mutationCallbacks,
  });
  const isPending = isSavingCategory || isSavingType;
  const saveItem =
    itemType === "CATEGORY" ? saveLocationCategory : saveLocationType;

  const typeName = itemType === "CATEGORY" ? "Categoria" : "Tipo";
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void saveItem({ data: new FormData(event.currentTarget) });
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      open={open}
      confirmLoading={isPending}
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
