import CLinearProgress from "@/components/ui/CLinearProgress";
import CSwitch from "@/components/ui/cSwtich";
import CDialog from "@/components/ui/dialog/cDialog";

const SaveTallyTemplateDialog = ({
  open,
  finalized,
  isRedirecting,
  isSaving,
  onClose,
  onFinalizedChange,
  onSave,
}: {
  open: boolean;
  finalized: boolean;
  isRedirecting: boolean;
  isSaving: boolean;
  onClose: () => void;
  onFinalizedChange: (finalized: boolean) => void;
  onSave: () => void;
}) => {
  return (
    <CDialog
      title="Salvar protocolo de contagem"
      open={open}
      onClose={onClose}
      cancelChildren={<>Cancelar</>}
      confirmChildren={<>Salvar</>}
      confirmLoading={isSaving}
      disableConfirmButton={isSaving || isRedirecting}
      disableCancelButton={isSaving || isRedirecting}
      onCancel={onClose}
      onConfirm={onSave}
      cancelVariant="outlined"
    >
      {isRedirecting ?
        <CLinearProgress label="Redirecionando..." />
      : <>
          <CSwitch
            label="Salvar como finalizado"
            checked={finalized}
            disabled={isSaving}
            onChange={(event) => onFinalizedChange(event.target.checked)}
          />
          <div>
            Protocolos de contagem salvos como finalizados não poderão mais ser
            editados.
          </div>
          <div>
            Apenas protocolos de contagem salvos como finalizados podem ser
            utilizados para realizar contagens.
          </div>
        </>
      }
    </CDialog>
  );
};

export default SaveTallyTemplateDialog;
