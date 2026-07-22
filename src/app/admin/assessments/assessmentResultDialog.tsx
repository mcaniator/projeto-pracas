import CLinearProgress from "@/components/ui/CLinearProgress";
import CAssessmentResultViewer from "@/components/ui/assessment/assessmentResultViewer";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import { FetchAssessmentTreeResponse } from "@/lib/serverFunctions/queries/assessment";
import { IconPencil } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const AssessmentResultDialog = ({
  assessment,
  open,
  onClose,
}: {
  assessment: {
    id: number;
    location: {
      name: string;
    };
    startDate: Date;
    endDate: Date | null;
  } | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [assessmentTree, setAssessmentTree] =
    useState<FetchAssessmentTreeResponse["assessmentTree"]>();
  const [fetchAssessmentTree, loading] = useFetchAssessmentTree({
    params: {
      callbacks: {
        onSuccess: (response) => {
          setAssessmentTree(response.data?.assessmentTree);
        },
      },
    },
  });
  useEffect(() => {
    if (!assessment) return;
    void fetchAssessmentTree({
      params: {
        assessmentId: String(assessment?.id),
      },
    });
  }, [assessment, fetchAssessmentTree]);
  if (!assessment) {
    return null;
  }
  return (
    <CDialog
      open={open}
      onClose={onClose}
      mobileFullScreen
      title={assessment.location.name}
      subtitle={`${dateTimeFormatter.format(new Date(assessment.startDate))} ${assessment.endDate ? `- ${dateTimeFormatter.format(new Date(assessment.endDate))}` : ""}`}
      confirmChildren={
        <>
          <IconPencil />
          Editar
        </>
      }
      confirmProps={{
        href: `/admin/assessments/details?assessmentId=${assessment.id}`,
        loadingOnClick: true,
      }}
    >
      {!loading && assessmentTree && (
        <CAssessmentResultViewer assessment={assessmentTree} />
      )}
      {loading && <CLinearProgress label="Carregando..." />}
    </CDialog>
  );
};

export default AssessmentResultDialog;
