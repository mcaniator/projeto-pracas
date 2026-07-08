"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import { useDeleteCity } from "@/lib/serverFunctions/apiCalls/city";
import { BrazilianStates } from "@prisma/client";
import { IconTrash } from "@tabler/icons-react";
import { FormEventHandler, useState } from "react";

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
  const [deleteCity, isLoading] = useDeleteCity({
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
  });
  const [numberOfLocations, setNumberOfLocations] = useState(0);
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void deleteCity({
      data: new FormData(event.currentTarget),
      projectOptions: { loadingMessage: "Excluindo cidade..." },
    });
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isLoading}
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
