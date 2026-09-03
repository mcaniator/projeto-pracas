import { AssessmentWithSyncStatus } from "@/app/admin/assessments/assessmentsClient";
import { useLoadingOverlay } from "@/components/context/loadingContext";
import CDialog from "@/components/ui/dialog/cDialog";
import { deleteAdminSQLiteAssessment } from "@/lib/capacitor/sqlite/adminSQLiteDb/queries/assessment";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useAppSnackbar } from "@/lib/hooks/useAppSnackbar";
import { IconAlertSquare, IconTrash } from "@tabler/icons-react";

const CancelAssessmentSyncDialog = ({
  assessment,
  onClose,
  onDeletion,
}: {
  assessment: AssessmentWithSyncStatus | null;
  onClose: () => void;
  onDeletion: () => void;
}) => {
  const { setLoadingOverlay } = useLoadingOverlay();
  const { notifyApiResponse } = useAppSnackbar();
  const deleteSQLiteAssessmentData = async () => {
    if (!assessment) return;
    setLoadingOverlay({ show: true, message: "Excluindo avaliação..." });

    const deleteAssessmentResponse = await deleteAdminSQLiteAssessment({
      data: {
        assessmentId: assessment.id,
      },
    });
    notifyApiResponse(deleteAssessmentResponse.responseInfo);
    setLoadingOverlay({ show: false });

    if (deleteAssessmentResponse.responseInfo.statusCode === 200) {
      onDeletion();
    }
    onClose();
  };
  return (
    <CDialog
      title="Excluir sincronização pendente"
      subtitle={`${assessment?.location.name} | ${dateTimeFormatter.format(assessment?.startDate)}${assessment?.endDate ? ` - ${dateTimeFormatter.format(assessment?.endDate)}` : ""}`}
      open={!!assessment}
      onClose={onClose}
      confirmChildren={<IconTrash />}
      confirmColor="error"
      onConfirm={() => {
        void deleteSQLiteAssessmentData();
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <IconAlertSquare size={32} color="red" />
        <p>Excluir Sincronização pendente?</p>
        <p>Os dados salvos no dispositivo local serão perdidos!</p>
      </div>
    </CDialog>
  );
};

export default CancelAssessmentSyncDialog;
