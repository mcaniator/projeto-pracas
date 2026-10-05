import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateModularTallyTemplateArchiveStatus } from "@/lib/serverFunctions/apiCalls/modularTally";
import { IconTrashX } from "@tabler/icons-react";
import { FormEventHandler } from "react";
import { FaTrashRestore } from "react-icons/fa";

const ModularTallyTemplateArchiveDialog = ({
  open,
  onClose,
  modularTallyTemplate,
  reloadModularTallyTemplates,
}: {
  open: boolean;
  onClose: () => void;
  modularTallyTemplate:
    | { id: number; name: string; archived: boolean; finalized: boolean }
    | undefined;
  reloadModularTallyTemplates: () => void;
}) => {
  const [updateArchiveStatus, isPending] =
    useUpdateModularTallyTemplateArchiveStatus({
      callbacks: {
        onSuccess() {
          reloadModularTallyTemplates();
          onClose();
        },
      },
    });

  if (!modularTallyTemplate) return null;

  const isDeleting = !modularTallyTemplate.archived;
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void updateArchiveStatus({
      data: {
        modularTallyTemplateId: modularTallyTemplate.id,
        archived: !modularTallyTemplate.archived,
      },
    });
  };

  return (
    <CDialog
      title={
        modularTallyTemplate.archived ?
          "Restaurar protocolo de contagem"
        : "Excluir protocolo de contagem"
      }
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isPending}
      subtitle={modularTallyTemplate.name}
      open={open}
      onClose={onClose}
      confirmColor={modularTallyTemplate.archived ? "primary" : "error"}
      confirmChildren={
        modularTallyTemplate.archived ?
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

export default ModularTallyTemplateArchiveDialog;
