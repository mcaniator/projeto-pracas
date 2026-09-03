import CDialog from "@/components/ui/dialog/cDialog";
import { useDeleteInvite } from "@/lib/serverFunctions/apiCalls/invite";
import { FetchInvitesResponse } from "@/lib/serverFunctions/queries/invite";
import { IconTrash } from "@tabler/icons-react";

const DeleteInviteDialog = ({
  open,
  onClose,
  invite,
  updateTable,
}: {
  open: boolean;
  onClose: () => void;
  invite: FetchInvitesResponse["invites"][number];
  updateTable: () => void;
}) => {
  const [action, loading] = useDeleteInvite({
    callbacks: {
      onSuccess() {
        updateTable();
        onClose();
      },
    },
  });
  return (
    <CDialog
      title="Excluir convite"
      subtitle={invite.email}
      open={open}
      onClose={onClose}
      confirmLoading={loading}
      confirmColor="error"
      confirmChildren={<IconTrash />}
      onConfirm={() => {
        void action({ data: { id: invite.id } });
      }}
    ></CDialog>
  );
};

export default DeleteInviteDialog;
