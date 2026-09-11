import CDialog from "@/components/ui/dialog/cDialog";
import { useDeletePersonCharacteristic } from "@/lib/serverFunctions/apiCalls/personCharacteristic";
import { IconTrash } from "@tabler/icons-react";

import type { PersonCharacteristic } from "./types";

const PersonCharacteristicDeletionDialog = ({
  characteristic,
  open,
  onClose,
  onDeleted,
}: {
  characteristic: PersonCharacteristic | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) => {
  const [deletePersonCharacteristic, isDeleting] =
    useDeletePersonCharacteristic({
      callbacks: {
        onSuccess: () => {
          onDeleted();
          onClose();
        },
      },
    });

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Excluir característica"
      subtitle={characteristic?.name}
      confirmChildren={<IconTrash />}
      confirmColor="error"
      confirmLoading={isDeleting}
      disableConfirmButton={!characteristic}
      onConfirm={() => {
        if (!characteristic) return;
        void deletePersonCharacteristic({
          data: { personCharacteristicId: characteristic.id },
          projectOptions: { loadingMessage: "Excluindo característica..." },
        });
      }}
    >
      <p className="text-red-600">
        Esta ação excluirá a característica permanentemente.
      </p>
    </CDialog>
  );
};

export default PersonCharacteristicDeletionDialog;
