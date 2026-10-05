import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateModularTallyTemplate } from "@/lib/serverFunctions/apiCalls/modularTally";
import { IconCheck } from "@tabler/icons-react";
import { FormEventHandler, useState } from "react";

const ModularTallyTemplateCreationDialog = ({
  open,
  cloneModularTallyTemplate,
  onClose,
  reloadModularTallyTemplates,
}: {
  open: boolean;
  cloneModularTallyTemplate?: { id: number; name: string };
  onClose: () => void;
  reloadModularTallyTemplates: () => void;
}) => {
  const [name, setName] = useState("");
  const [createModularTallyTemplate, isPending] =
    useCreateModularTallyTemplate({
      callbacks: {
        onSuccess() {
          reloadModularTallyTemplates();
          setName("");
          onClose();
        },
      },
    });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void createModularTallyTemplate({
      data: {
        name,
        cloneModularTallyTemplateId: cloneModularTallyTemplate?.id,
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
        cloneModularTallyTemplate ?
          "Clonar protocolo de contagem"
        : "Criar protocolo de contagem"
      }
      subtitle={cloneModularTallyTemplate?.name}
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

export default ModularTallyTemplateCreationDialog;
