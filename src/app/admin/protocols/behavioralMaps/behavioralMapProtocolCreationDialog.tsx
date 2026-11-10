import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateBehavioralMapProtocol } from "@/lib/serverFunctions/apiCalls/behavioralMapProtocol";
import { IconCheck } from "@tabler/icons-react";
import { FormEventHandler, useState } from "react";

type ProtocolReference = { id: number; name: string };

const BehavioralMapProtocolCreationDialog = ({
  open,
  cloneProtocol,
  onClose,
  reloadProtocols,
}: {
  open: boolean;
  cloneProtocol?: ProtocolReference;
  onClose: () => void;
  reloadProtocols: () => void;
}) => {
  const [name, setName] = useState("");
  const [createProtocol, isPending] = useCreateBehavioralMapProtocol({
    callbacks: {
      onSuccess() {
        reloadProtocols();
        setName("");
        onClose();
      },
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void createProtocol({
      data: { name, cloneBehavioralMapProtocolId: cloneProtocol?.id },
    });
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isPending}
      title={cloneProtocol ? "Clonar protocolo de mapa comportamental" : "Criar protocolo de mapa comportamental"}
      subtitle={cloneProtocol?.name}
      confirmChildren={<IconCheck />}
      open={open}
      onClose={handleClose}
    >
      <div className="flex flex-col gap-1">
        <CTextField
          type="text"
          name="name"
          id="behavioral-map-protocol-name"
          label="Nome do protocolo"
          value={name}
          required
          maxCharacters={255}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
    </CDialog>
  );
};

export default BehavioralMapProtocolCreationDialog;

