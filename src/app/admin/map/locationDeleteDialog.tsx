"use client";

import CDialog from "@/components/ui/dialog/cDialog";
import { _deleteLocation } from "@/lib/serverFunctions/serverActions/locationUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { IconTrash } from "@tabler/icons-react";
import { useEffect } from "react";

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
  const [formAction, state] = useResettableActionState(_deleteLocation, {
    loadingMessage: "Excluindo praça...",
  });
  useEffect(() => {
    if (state?.responseInfo.statusCode === 200) {
      onDeletionSuccess();
    }
  }, [state, onDeletionSuccess]);
  return (
    <CDialog
      isForm
      action={formAction}
      title="Excluir praça"
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
