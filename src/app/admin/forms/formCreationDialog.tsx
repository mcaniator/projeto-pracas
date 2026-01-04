import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { _createForm } from "@/lib/serverFunctions/serverActions/formUtil";
import { useResettableActionState } from "@/lib/utils/useResettableActionState";
import { IconCheck } from "@tabler/icons-react";

const FormCreationDialog = ({
  open,
  onClose,
  reloadForms,
}: {
  open: boolean;
  onClose: () => void;
  reloadForms: () => void;
}) => {
  const [formAction, isPending] = useResettableActionState({
    action: _createForm,
    callbacks: {
      onSuccess() {
        reloadForms();
        onClose();
      },
    },
  });
  return (
    <CDialog
      isForm
      action={formAction}
      confirmLoading={isPending}
      title="Criar formulário"
      confirmChildren={<IconCheck />}
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col gap-1">
        <CTextField
          type="text"
          name="name"
          id={"name"}
          label="Nome do formulário"
          required
        />
      </div>
    </CDialog>
  );
};

export default FormCreationDialog;
