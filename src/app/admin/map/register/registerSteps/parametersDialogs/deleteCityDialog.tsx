"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import { _deleteCity } from "@/lib/serverFunctions/serverActions/city";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { BrazilianStates } from "@prisma/client";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";

const DeleteCityDialog = ({
  open,
  selectedItem,
  cityState,
  onClose,
  reloadItems,
}: {
  open: boolean;
  selectedItem: {
    id: number;
    name: string;
  } | null;
  cityState?: BrazilianStates;
  onClose: () => void;
  reloadItems: () => void;
}) => {
  const [formAction] = useResettableActionState({
    action: _deleteCity,
    callbacks: {
      onSuccess() {
        reloadItems();
        setNumberOfLocations(0);
        onClose();
      },
      onError(state) {
        if (state.data?.numberOfLocations) {
          setNumberOfLocations(state.data?.numberOfLocations);
        }
      },
    },
    options: {
      loadingMessage: "Excluindo cidade...",
    },
  });
  const [numberOfLocations, setNumberOfLocations] = useState(0);
  return (
    <CDialog
      isForm
      action={formAction}
      open={open}
      onClose={onClose}
      title={"Excluir cidade"}
      subtitle={`${cityState} - ${selectedItem?.name}`}
      confirmChildren={<IconTrash />}
      confirmColor="error"
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="cityId" value={selectedItem?.id} />
        {numberOfLocations > 0 && (
          <>
            <div className="text-red-500">{`Erro ao excluir cidade!`}</div>
            <div>{`Existem ${numberOfLocations} praças associadas a essa cidade!`}</div>
          </>
        )}
      </div>
    </CDialog>
  );
};

export default DeleteCityDialog;
