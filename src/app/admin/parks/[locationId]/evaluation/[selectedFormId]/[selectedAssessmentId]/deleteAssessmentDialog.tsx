import { IconAlertSquareRounded } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";

import { useHelperCard } from "../../../../../../../components/context/helperCardContext";
import { useLoadingOverlay } from "../../../../../../../components/context/loadingContext";
import CDialog from "../../../../../../../components/ui/dialog/cDialog";
import { _deleteAssessment } from "../../../../../../../lib/serverFunctions/serverActions/assessmentUtil";

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
  const handleDelete = async () => {
    try {
      setLoadingOverlay({ show: true, message: "Excluindo avaliação..." });
      const response = await _deleteAssessment(assessmentId);
      helperCardProcessResponse(response.responseInfo);
      if (response.responseInfo.statusCode === 200) {
        router.push(`/admin/parks/${locationId}`);
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
        <IconAlertSquareRounded size={32} color="red" />
        <p>
          Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser
          desfeita.
        </p>
      </div>
    </CDialog>
  );
};

export default DeleteAssessmentDialog;
