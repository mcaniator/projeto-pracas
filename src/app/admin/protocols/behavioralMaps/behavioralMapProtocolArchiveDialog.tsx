import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateBehavioralMapProtocolArchiveStatus } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import { IconTrashX } from "@tabler/icons-react";
import { FormEventHandler } from "react";
import { FaTrashRestore } from "react-icons/fa";

type ProtocolReference = { id: number; name: string; archived: boolean; finalized: boolean };

const BehavioralMapProtocolArchiveDialog = ({
  open,
  onClose,
  protocol,
  reloadProtocols,
}: {
  open: boolean;
  onClose: () => void;
  protocol?: ProtocolReference;
  reloadProtocols: () => void;
}) => {
  const [updateArchiveStatus, isPending] = useUpdateBehavioralMapProtocolArchiveStatus({
    callbacks: {
      onSuccess() {
        reloadProtocols();
        onClose();
      },
    },
  });

  if (!protocol) return null;
  const isDeleting = !protocol.archived;
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void updateArchiveStatus({
      data: { behavioralMapProtocolId: protocol.id, archived: !protocol.archived },
    });
  };

  return (
    <CDialog
      title={protocol.archived ? "Restaurar protocolo de mapa comportamental" : "Excluir protocolo de mapa comportamental"}
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isPending}
      subtitle={protocol.name}
      open={open}
      onClose={onClose}
      confirmColor={protocol.archived ? "primary" : "error"}
      confirmChildren={protocol.archived ? <FaTrashRestore size={24} /> : <IconTrashX />}
    >
      {isDeleting && (
        <span className="text-md text-red-500">
          Este protocolo será excluído permanentemente caso não tenha análises associadas. Caso tenha, será apenas arquivado.
        </span>
      )}
    </CDialog>
  );
};

export default BehavioralMapProtocolArchiveDialog;
