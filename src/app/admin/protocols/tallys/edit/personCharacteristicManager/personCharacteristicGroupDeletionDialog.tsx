import CDialog from "@/components/ui/dialog/cDialog";
import { useDeletePersonCharacteristicGroup } from "@/lib/serverFunctions/apiCalls/personCharacteristic";
import { IconTrash } from "@tabler/icons-react";

import type { PersonCharacteristicGroup } from "./types";

const PersonCharacteristicGroupDeletionDialog = ({
  group,
  open,
  onClose,
  onDeleted,
}: {
  group: PersonCharacteristicGroup | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) => {
  const [deletePersonCharacteristicGroup, isDeleting] =
    useDeletePersonCharacteristicGroup({
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
      title="Excluir grupo"
      subtitle={group?.title}
      confirmChildren={<IconTrash />}
      confirmColor="error"
      confirmLoading={isDeleting}
      disableConfirmButton={!group}
      onConfirm={() => {
        if (!group) return;
        void deletePersonCharacteristicGroup({
          data: { personCharacteristicGroupId: group.id },
          projectOptions: { loadingMessage: "Excluindo grupo..." },
        });
      }}
    >
      <p className="text-red-600">
        Esta ação também excluirá as características do grupo e não poderá ser
        desfeita.
      </p>
    </CDialog>
  );
};

export default PersonCharacteristicGroupDeletionDialog;
