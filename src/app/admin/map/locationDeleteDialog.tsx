"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import { useDeleteLocation } from "@/lib/serverFunctions/apiCalls/location";
import { IconTrash } from "@tabler/icons-react";
import { FormEventHandler } from "react";

const LocationDeleteDialog = ({
  open,
  onClose,
  onDeletionSuccess,
  location,
}: {
  open: boolean;
  onClose: () => void;
  onDeletionSuccess: () => void;
  location: { id: number; name: string };
}) => {
  const [deleteLocation, isLoading] = useDeleteLocation({
    callbacks: {
      onSuccess() {
        onDeletionSuccess();
      },
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void deleteLocation({
      data: new FormData(event.currentTarget),
      projectOptions: { loadingMessage: "Excluindo praca..." },
    });
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isLoading}
      title="Excluir praca"
      subtitle={location.name}
      open={open}
      onClose={onClose}
      confirmColor="error"
      confirmChildren={<IconTrash />}
    >
      <input type="hidden" name="id" value={location.id} />
    </CDialog>
  );
};

export default LocationDeleteDialog;
