import CSwitch from "@components/ui/cSwtich";
import CDialog from "@components/ui/dialog/cDialog";
import { Dispatch, SetStateAction } from "react";

const SaveFormDialog = ({
  openSaveFormDialog,
  saveAsDone,
  setSaveAsDone,
  setOpenSaveFormDialog,
  save,
}: {
  openSaveFormDialog: boolean;
  saveAsDone: boolean;
  setSaveAsDone: Dispatch<SetStateAction<boolean>>;
  setOpenSaveFormDialog: Dispatch<SetStateAction<boolean>>;
  save: () => void;
}) => {
  return (
    <CDialog
      title="Salvar formulário"
      open={openSaveFormDialog}
      onClose={() => {
        setOpenSaveFormDialog(false);
      }}
      cancelChildren={<>Cancelar</>}
      confirmChildren={<>Salvar</>}
      onCancel={() => {
        setOpenSaveFormDialog(false);
      }}
      onConfirm={() => {
        save();
      }}
      cancelVariant="outlined"
    >
      <CSwitch
        label="Salvar como finalizado"
        checked={saveAsDone}
        onChange={(e) => {
          setSaveAsDone(e.target.checked);
        }}
      />
      <div>
        Formulários salvos como finalizados não poderão mais ser editados.
      </div>
      <div>
        Apenas formulários salvos como finalizados podem ser utilizados para
        avaliações.
      </div>
    </CDialog>
  );
};

export default SaveFormDialog;
