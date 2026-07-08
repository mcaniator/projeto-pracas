import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateUserArchive } from "@/lib/serverFunctions/apiCalls/user";
import { FetchUsersResponse } from "@/lib/serverFunctions/queries/user";
import { IconTrash } from "@tabler/icons-react";
import { FaTrashRestore } from "react-icons/fa";

const ArchiveUserDialog = ({
  open,
  onClose,
  user,
  updateTable,
}: {
  open: boolean;
  onClose: () => void;
  user: FetchUsersResponse["users"][number];
  updateTable: () => void;
}) => {
  const [update, loading] = useUpdateUserArchive({
    callbacks: {
      onSuccess() {
        updateTable();
        onClose();
      },
    },
  });
  return (
    <CDialog
      open={open}
      onClose={onClose}
      title={user.active ? "Desativar usuário" : "Ativar usuário"}
      subtitle={user.username ?? user.email}
      confirmColor={user.active ? "error" : "primary"}
      confirmChildren={
        user.active ? <IconTrash /> : <FaTrashRestore size={24} />
      }
      confirmSx={{
        color: user.active ? "error" : "primary",
      }}
      onConfirm={() => {
        void update({ data: { userId: user.id, active: !user.active } });
      }}
      confirmLoading={loading}
    ></CDialog>
  );
};

export default ArchiveUserDialog;
