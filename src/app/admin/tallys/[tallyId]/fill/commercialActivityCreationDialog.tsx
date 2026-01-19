import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconCheck } from "@tabler/icons-react";

const CommercialActivityCreationDialog = ({
  open,
  onClose,
  create,
}: {
  open: boolean;
  onClose: () => void;
  create: (name: string) => void;
}) => {
  const handleSubmit = (formData: FormData) => {
    const name = formData.get("name") as string;
    create(name);
    onClose();
  };
  return (
    <CDialog
      isForm
      action={handleSubmit}
      open={open}
      onClose={onClose}
      title="Criar Atividade Comercial itinerante"
      confirmChildren={<IconCheck />}
    >
      <div className="flex flex-col gap-1">
        <CTextField required label="Nome" name="name" />
      </div>
    </CDialog>
  );
};

export default CommercialActivityCreationDialog;
