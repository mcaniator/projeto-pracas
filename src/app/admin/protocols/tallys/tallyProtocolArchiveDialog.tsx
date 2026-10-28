import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateTallyProtocolArchiveStatus } from "@/lib/serverFunctions/apiCalls/tally";
import { IconTrashX } from "@tabler/icons-react";
import { FormEventHandler } from "react";
import { FaTrashRestore } from "react-icons/fa";

const TallyProtocolArchiveDialog = ({
  open,
  onClose,
  tallyProtocol,
  reloadTallyProtocols,
}: {
  open: boolean;
  onClose: () => void;
  tallyProtocol:
    | { id: number; name: string; archived: boolean; finalized: boolean }
    | undefined;
  reloadTallyProtocols: () => void;
}) => {
  const [updateArchiveStatus, isPending] =
    useUpdateTallyProtocolArchiveStatus({
      callbacks: {
        onSuccess() {
          reloadTallyProtocols();
          onClose();
        },
      },
    });

  if (!tallyProtocol) return null;

  const isDeleting = !tallyProtocol.archived;
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void updateArchiveStatus({
      data: {
        tallyProtocolId: tallyProtocol.id,
        archived: !tallyProtocol.archived,
      },
    });
  };

  return (
    <CDialog
      title={
        tallyProtocol.archived ?
          "Restaurar protocolo de contagem"
        : "Excluir protocolo de contagem"
      }
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isPending}
      subtitle={tallyProtocol.name}
      open={open}
      onClose={onClose}
      confirmColor={tallyProtocol.archived ? "primary" : "error"}
      confirmChildren={
        tallyProtocol.archived ?
          <FaTrashRestore size={24} />
        : <IconTrashX />
      }
    >
      {isDeleting && (
        <span className="text-md text-red-500">
          Este protocolo será excluído permanentemente caso não tenha contagens
          associadas. Caso tenha, será apenas arquivado.
        </span>
      )}
    </CDialog>
  );
};

export default TallyProtocolArchiveDialog;
