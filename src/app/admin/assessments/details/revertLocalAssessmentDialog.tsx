import CDialog from "@/components/ui/dialog/cDialog";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { IconAlertSquareRounded, IconArrowBackUp } from "@tabler/icons-react";

const RevertLocalAssessmentDialog = ({
  open,
  onClose,
  localUpdatedAt,
  serverUpdatedAt,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  localUpdatedAt: Date | undefined;
  serverUpdatedAt: Date;
  onConfirm: () => void;
}) => {
  return (
    <CDialog
      title="Reverter alterações locais"
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
          Tem certeza que deseja descartar os dados não salvos neste e usar a
          versão salva anteriormente?
        </p>
        <div className="flex flex-col gap-1 text-left">
          <p>
            <strong>Alteração não salva:</strong>{" "}
            {localUpdatedAt ? dateTimeFormatter.format(localUpdatedAt) : null}
          </p>
          <p>
            <strong>Versão anterior:</strong>{" "}
            {dateTimeFormatter.format(serverUpdatedAt)}
          </p>
        </div>
      </div>
    </CDialog>
  );
};

export default RevertLocalAssessmentDialog;
