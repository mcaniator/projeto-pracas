import CDialog from "@/components/ui/dialog/cDialog";
import { _updateFormArchiveStatus } from "@/lib/serverFunctions/serverActions/formUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { IconTrashX } from "@tabler/icons-react";
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
  const [formAction, isPending] = useResettableActionState({
    action: _updateFormArchiveStatus,
    callbacks: {
      onSuccess() {
        reloadForms();
        onClose();
      },
    },
  });
  if (!formToArchive) return null;
  return (
    <CDialog
      title={
        formToArchive.archived ?
          "Desarquivar formulário"
        : "Arquivar formulário"
      }
      isForm
      action={formAction}
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
        {!formToArchive.finalized && (
          <span className="text-md text-red-500">
            Este formulário está em construção! Ele será excluído
            permanentemente.
          </span>
        )}
      </div>
    </CDialog>
  );
};

export default FormArchiveDialog;
