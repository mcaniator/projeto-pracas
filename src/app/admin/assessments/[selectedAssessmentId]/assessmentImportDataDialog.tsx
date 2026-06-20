import CButtonFilePicker from "@/components/ui/cButtonFilePicker";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconFileUpload } from "@tabler/icons-react";

const AssessmentImportDataDialog = ({
  open,
  onClose,
  onFileInput,
}: {
  open: boolean;
  onClose: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <CDialog title="Importar avaliação" open={open} onClose={onClose}>
      <p>Importar dados da avaliação a partir de um arquivo</p>
      <CButtonFilePicker
        fileAccept="application/json"
        onFileInput={onFileInput}
      >
        <IconFileUpload /> Importar
      </CButtonFilePicker>
    </CDialog>
  );
};

export default AssessmentImportDataDialog;
