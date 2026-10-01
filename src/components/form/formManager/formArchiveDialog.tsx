import CDialog from "@/components/ui/dialog/cDialog";
import { useUpdateFormArchiveStatus } from "@/lib/serverFunctions/apiCalls/form";
import { IconTrashX } from "@tabler/icons-react";
import { FormEventHandler } from "react";
import { FaTrashRestore } from "react-icons/fa";

const FormArchiveDialog = ({
  open,
  onClose,
  formToArchive,
  reloadForms,
}: {
  open: boolean;
  onClose: () => void;
  formToArchive:
    | { id: number; name: string; archived: boolean; finalized: boolean }
    | undefined;
  reloadForms: () => void;
}) => {
  const [updateArchiveStatus, isPending] = useUpdateFormArchiveStatus({
    callbacks: {
      onSuccess() {
        reloadForms();
        onClose();
      },
    },
  });

  if (!formToArchive) return null;
  const isDeleting = !formToArchive.archived;
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void updateArchiveStatus({ data: new FormData(event.currentTarget) });
  };

  return (
    <CDialog
      title={
        formToArchive.archived ? "Restaurar formulário" : "Excluir formulário"
      }
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isPending}
      subtitle={formToArchive.name}
      open={open}
      onClose={onClose}
      confirmColor={formToArchive.archived ? "primary" : "error"}
      confirmChildren={
        formToArchive.archived ? <FaTrashRestore size={24} /> : <IconTrashX />
      }
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="formId" value={formToArchive.id} />
        <input
          type="hidden"
          name="archived"
          value={formToArchive.archived ? "false" : "true"}
        />
        {isDeleting && (
          <span className="text-md text-red-500">
            {formToArchive.finalized ?
              "Este formulário será excluído permanentemente caso não tenha avaliações associadas. Caso tenha, será apenas arquivado."
            : "Este formulário está em construção! Ele será excluído permanentemente."
            }
          </span>
        )}
      </div>
    </CDialog>
  );
};

export default FormArchiveDialog;
