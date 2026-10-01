import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useCreateForm } from "@/lib/serverFunctions/apiCalls/form";
import type { FormUse } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { FormEventHandler } from "react";

const FormCreationDialog = ({
  open,
  formUse,
  cloneForm,
  onClose,
  reloadForms,
}: {
  open: boolean;
  formUse: FormUse;
  cloneForm?: { id: number; name: string };
  onClose: () => void;
  reloadForms: () => void;
}) => {
  const [createForm, isPending] = useCreateForm({
    callbacks: {
      onSuccess() {
        reloadForms();
        onClose();
      },
    },
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void createForm({ data: new FormData(event.currentTarget) });
  };

  return (
    <CDialog
      isForm
      onSubmit={handleSubmit}
      confirmLoading={isPending}
      title={cloneForm ? "Clonar formulário" : "Criar formulário"}
      subtitle={cloneForm?.name}
      confirmChildren={<IconCheck />}
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-col gap-1">
        <input type="hidden" name="formUse" value={formUse} />
        <input type="hidden" name="cloneFormId" value={cloneForm?.id} />
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
