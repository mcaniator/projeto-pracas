import CDialog from "@/components/ui/dialog/cDialog";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { IconAlertSquareRounded, IconArrowBackUp } from "@tabler/icons-react";

const RevertAssessmentDraftDialog = ({
  open,
  onClose,
  draftUpdatedAt,
  savedUpdatedAt,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  draftUpdatedAt: Date | undefined;
  savedUpdatedAt: Date;
  onConfirm: () => void;
}) => {
  return (
    <CDialog
      title="Reverter alterações do rascunho"
      open={open}
      onClose={onClose}
      cancelChildren={<>Cancelar</>}
      onCancel={onClose}
      confirmChildren={
        <>
          <IconArrowBackUp />
          Reverter
        </>
      }
      confirmColor="warning"
      onConfirm={onConfirm}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <IconAlertSquareRounded size={32} color="orange" />
        <p>
          Tem certeza que deseja descartar os dados não salvos e usar a versão
          salva anteriormente?
        </p>
        <div className="flex flex-col gap-1 text-left">
          <p>
            <strong>Alteração não salva:</strong>{" "}
            {draftUpdatedAt ? dateTimeFormatter.format(draftUpdatedAt) : null}
          </p>
          <p>
            <strong>Versão anterior:</strong>{" "}
            {dateTimeFormatter.format(savedUpdatedAt)}
          </p>
        </div>
      </div>
    </CDialog>
  );
};

export default RevertAssessmentDraftDialog;
