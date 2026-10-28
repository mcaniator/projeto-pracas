import { deleteTallyDraft } from "@/app/admin/tallys/details/tallyDraft";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CDialog from "@/components/ui/dialog/cDialog";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { useDeleteTally } from "@/lib/serverFunctions/apiCalls/tally";
import { LinearProgress } from "@mui/material";
import { IconAlertSquareRounded, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const DeleteTallyDialog = ({
  open,
  onClose,
  tallyId,
}: {
  open: boolean;
  onClose: () => void;
  tallyId: number;
}) => {
  const { enqueueSnackbar } = useAppSnackbar();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { isConnected } = useNetwork();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [deleteTally] = useDeleteTally();

  const handleDelete = async () => {
    try {
      setLoadingOverlay({ show: true, message: "Excluindo contagem..." });
      const response = await deleteTally({
        data: { tallyId },
      });

      if (response.responseInfo.statusCode === 200) {
        await deleteTallyDraft(tallyId);
        setIsRedirecting(true);
        router.push("/admin/tallys");
      }
    } catch {
      enqueueSnackbar("Erro ao excluir contagem!", { variant: "error" });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  return (
    <CDialog
      title="Excluir contagem"
      open={open}
      onClose={onClose}
      confirmChildren={
        <>
          <IconTrash />
          Excluir
        </>
      }
      confirmProps={{ disabled: !isConnected || isRedirecting }}
      confirmColor="error"
      onConfirm={() => void handleDelete()}
    >
      <div className="flex flex-col items-center gap-1">
        {isRedirecting ?
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Redirecionando...
          </div>
        : <>
            <IconAlertSquareRounded size={32} color="red" />
            <p>Tem certeza que deseja excluir esta contagem?</p>
          </>
        }
      </div>
    </CDialog>
  );
};

export default DeleteTallyDialog;
