import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateTallyProtocol } from "@/lib/serverFunctions/apiCalls/tally";
import { IconCheck } from "@tabler/icons-react";
import { FormEventHandler, useState } from "react";

const TallyProtocolCreationDialog = ({
  open,
  cloneTallyProtocol,
  onClose,
  reloadTallyProtocols,
}: {
  open: boolean;
  cloneTallyProtocol?: { id: number; name: string };
  onClose: () => void;
  reloadTallyProtocols: () => void;
}) => {
  const [name, setName] = useState("");
  const [createTallyProtocol, isPending] =
    useCreateTallyProtocol({
      callbacks: {
        onSuccess() {
          reloadTallyProtocols();
          setName("");
          onClose();
        },
      },
    });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void createTallyProtocol({
      data: {
        name,
        cloneTallyProtocolId: cloneTallyProtocol?.id,
      },
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
      title={
        cloneTallyProtocol ?
          "Clonar protocolo de contagem"
        : "Criar protocolo de contagem"
      }
      subtitle={cloneTallyProtocol?.name}
      confirmChildren={<IconCheck />}
      open={open}
      onClose={handleClose}
    >
      <div className="flex flex-col gap-1">
        <CTextField
          type="text"
          name="name"
          id="name"
          label="Nome do protocolo de contagem"
          value={name}
          required
          onChange={(event) => setName(event.target.value)}
        />
      </div>
    </CDialog>
  );
};

export default TallyProtocolCreationDialog;
