import CDialog from "@/components/ui/dialog/cDialog";
import { _deleteTally } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { useServerAction } from "@/lib/utils/useServerAction";
import { LinearProgress } from "@mui/material";
import { IconAlertSquareRounded } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const TallyInProgressDeleteDialog = ({
  open,
  onClose,
  tallyId,
}: {
  open: boolean;
  onClose: () => void;
  tallyId: number;
}) => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [deleteTally, isLoading] = useServerAction({
    action: _deleteTally,
    callbacks: {
      onSuccess: () => {
        setIsRedirecting(true);
        router.push("/admin/tallys");
      },
    },
    options: {
      loadingMessage: "Excluindo contagem...",
    },
  });
  return (
    <CDialog
      open={open}
      onClose={onClose}
      title="Excluir contagem"
      confirmChildren={!isRedirecting && <>Excluir</>}
      confirmColor="error"
      confirmLoading={isLoading}
      onConfirm={() => {
        void deleteTally({ tallyId });
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {isRedirecting ?
          <div className="flex w-full flex-col justify-center text-lg">
            <LinearProgress />
            Redirecionando...
          </div>
        : <>
            <IconAlertSquareRounded size={32} color="red" />
            <p>Tem certeza que deseja excluir esta avaliação?</p>
          </>
        }
      </div>
    </CDialog>
  );
};

export default TallyInProgressDeleteDialog;
