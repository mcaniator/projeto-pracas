import CDialog from "@/components/ui/dialog/cDialog";
import { FetchInvitesResponse } from "@/lib/serverFunctions/queries/invite";
import { _deleteInviteV2 } from "@/lib/serverFunctions/serverActions/inviteUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
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
  const [action, loading] = useServerAction({
    action: _deleteInviteV2,
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
        void action({ id: invite.id });
      }}
    ></CDialog>
  );
};

export default DeleteInviteDialog;
