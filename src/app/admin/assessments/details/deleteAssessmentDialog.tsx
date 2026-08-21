import { useLoadingOverlay } from "@/components/context/loadingContext";
import { useNetwork } from "@/components/context/networkContext";
import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import {
  deleteAdminSQLiteAssessment,
  fetchAdminSQLiteAssessmentTableData,
} from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { useDeleteAssessment } from "@/lib/serverFunctions/apiCalls/assessment";
import { DeleteAssessmentData } from "@/lib/serverFunctions/mutations/assessmentUtil";
import { APIResponse } from "@/lib/types/backendCalls/APIResponse";
import { Capacitor } from "@capacitor/core";
import { LinearProgress } from "@mui/material";
import { IconAlertSquareRounded, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";

const DeleteAssessmentDialog = ({
  open,
  onClose,
  assessmentId,
  locationId,
  isSQLiteAssessment,
}: {
  open: boolean;
  onClose: () => void;
  assessmentId: number;
  locationId: number;
  isSQLiteAssessment: boolean;
}) => {
  const { enqueueSnackbar, notifyApiResponse } = useAppSnackbar();
  const { setLoadingOverlay } = useLoadingOverlay();
  const { isConnected } = useNetwork();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoadingSQLiteAssessmentData, setIsLoadingSQLiteAssessmentData] =
    useState(false);
  const [canDeleteAssessment, setCanDeleteAssessment] = useState(false);
  const [deleteAssessment] = useDeleteAssessment();
  const handleDelete = async () => {
    try {
      setLoadingOverlay({ show: true, message: "Excluindo avaliação..." });
      let response: APIResponse<DeleteAssessmentData> | null = null;
      if (isSQLiteAssessment) {
        response = await deleteAdminSQLiteAssessment({
          data: { assessmentId },
        });
        notifyApiResponse(response.responseInfo);
      } else {
        response = await deleteAssessment({
          data: { assessmentId },
        });
      }

      if (response.responseInfo.statusCode === 200) {
        setIsRedirecting(true);
        router.push(`/admin/assessments?locationId=${locationId}`);
      } else {
        setLoadingOverlay({ show: false });
      }
    } catch (e) {
      enqueueSnackbar(<>Erro ao excluir avaliação!</>, { variant: "error" });
      setLoadingOverlay({ show: false });
    } finally {
      setLoadingOverlay({ show: false });
    }
  };

  useEffect(() => {
    const checkIfCanDelete = async () => {
      if (Capacitor.isNativePlatform() && isSQLiteAssessment) {
        setIsLoadingSQLiteAssessmentData(true);
        const response = await fetchAdminSQLiteAssessmentTableData({
          params: {
            assessmentId: assessmentId,
          },
        });
        setIsLoadingSQLiteAssessmentData(false);
        setCanDeleteAssessment(response.data?.createdLocally ?? false);
      } else {
        setCanDeleteAssessment(true);
      }
    };

    void checkIfCanDelete();
  }, [isSQLiteAssessment, assessmentId]);

  return (
    <CDialog
      title="Excluir Avaliação"
      open={open}
      onClose={onClose}
      confirmChildren={
        <>
          <IconTrash />
          Excluir
        </>
      }
      confirmProps={{
        disabled: !canDeleteAssessment || (!isSQLiteAssessment && !isConnected),
      }}
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
        : isLoadingSQLiteAssessmentData ?
          <>
            <CLinearProgress label="Carregando..." />
          </>
        : canDeleteAssessment ?
          <>
            <IconAlertSquareRounded size={32} color="red" />
            <p>Tem certeza que deseja excluir esta avaliação?</p>
          </>
        : <>
            <IconAlertSquareRounded size={32} color="red" />
            <p>
              Esta avaliação existe no servidor e só pode ser excluída após
              sincronização.
            </p>
          </>
        }
      </div>
    </CDialog>
  );
};

export default DeleteAssessmentDialog;
