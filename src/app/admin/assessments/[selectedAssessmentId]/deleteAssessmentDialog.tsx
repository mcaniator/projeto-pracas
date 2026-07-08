import { useHelperCard } from "@/components/context/helperCardContext";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDialog from "@/components/ui/dialog/cDialog";
import { useDeleteAssessment } from "@/lib/serverFunctions/apiCalls/assessment";
import { LinearProgress } from "@mui/material";
import { IconAlertSquareRounded } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const DeleteAssessmentDialog = ({
  open,
  onClose,
  assessmentId,
  locationId,
}: {
  open: boolean;
  onClose: () => void;
  assessmentId: number;
  locationId: number;
}) => {
  const { setHelperCard, helperCardProcessResponse } = useHelperCard();
  const { setLoadingOverlay } = useLoadingOverlay();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [deleteAssessment] = useDeleteAssessment();
  const handleDelete = async () => {
    try {
      setLoadingOverlay({ show: true, message: "Excluindo avaliação..." });
      const response = await deleteAssessment({
        data: { assessmentId },
      });
      helperCardProcessResponse(response.responseInfo);
      setIsRedirecting(true);
      if (response.responseInfo.statusCode === 200) {
        router.push(`/admin/assessments?locationId=${locationId}`);
      } else {
        setLoadingOverlay({ show: false });
      }
    } catch (e) {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir avaliação!</>,
      });
      setLoadingOverlay({ show: false });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };
  return (
    <CDialog
      title="Excluir Avaliação"
      open={open}
      onClose={onClose}
      confirmChildren={<>Excluir</>}
      confirmColor="error"
      onConfirm={() => {
        void handleDelete();
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

export default DeleteAssessmentDialog;
