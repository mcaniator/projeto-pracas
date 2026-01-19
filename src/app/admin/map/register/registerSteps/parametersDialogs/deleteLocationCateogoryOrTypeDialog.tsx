"use client";

import { CategoryOrType } from "@/app/admin/map/register/registerSteps/addressStep";
import CDialog from "@/components/ui/dialog/cDialog";
import { _deleteLocationCategoryOrType } from "@/lib/serverFunctions/serverActions/locationCategory";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const DeleteLocationCateogryOrTypeDialog = ({
  open,
  selectedItem,
  onClose,
  reloadItems,
  itemType,
}: {
  open: boolean;
  selectedItem: {
    id: number;
    name: string;
  } | null;
  onClose: () => void;
  reloadItems: () => void;
  itemType: CategoryOrType;
}) => {
  const typeName = itemType === "CATEGORY" ? "Categoria" : "Tipo";
  const [formAction] = useResettableActionState({
    action: _deleteLocationCategoryOrType,
    callbacks: {
      onSuccess() {
        reloadItems();
        setConflictingLocations([]);
        onClose();
      },
      onError(state) {
        if (state?.data?.conflictingItems) {
          setConflictingLocations(state.data?.conflictingItems ?? []);
        }
      },
    },
    options: {
      loadingMessage: "Excluindo...",
    },
  });
  const [conflictingLocations, setConflictingLocations] = useState<
    {
      cityId: number;
      cityName: string;
      locations: { name: string }[];
    }[]
  >([]);

  const handleClose = () => {
    setConflictingLocations([]);
    onClose();
  };

  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={handleClose}
      title={itemType === "CATEGORY" ? "Excluir categoria" : "Excluir tipo"}
      subtitle={selectedItem?.name}
      confirmChildren={<IconTrash />}
      confirmColor="error"
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="itemId" value={selectedItem?.id} />
        <input type="hidden" name="itemType" value={itemType} />
        {conflictingLocations.length > 0 && (
          <>
            <div className="text-red-500">{`Erro ao excluir ${typeName}!`}</div>
            <div>
              {itemType === "CATEGORY" ?
                "Categoria usadas nas seguintes praças:"
              : "Tipo usados nas seguintes praças!"}
            </div>
            <ul className="list-inside space-y-2">
              {conflictingLocations.map((cl, index) => (
                <li
                  key={index}
                  className="px-2 py-3 font-bold outline outline-1"
                >
                  {cl.cityName}:
                  <ul className="list-inside list-disc space-y-2">
                    {cl.locations.map((l, index2) => (
                      <li
                        key={index2}
                        className="list-disc px-2 py-3 font-bold"
                      >
                        {l.name}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </CDialog>
  );
};

export default DeleteLocationCateogryOrTypeDialog;
