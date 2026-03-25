import CLinearProgress from "@/components/ui/CLinearProgress";
import AssessmentResultViewer from "@/components/ui/assessment/assessmentResultViewer";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import {
  FetchAssessmentTreeResponse,
  FetchPublicAssessmentsResponse,
} from "@/lib/serverFunctions/queries/assessment";
import { useEffect, useState } from "react";

const AssessmentResultViewerDialog = ({
  selectedAssessment,
  locationName,
  onClose,
}: {
  selectedAssessment:
    | FetchPublicAssessmentsResponse["assessments"][number]
    | null;
  locationName: string;
  onClose: () => void;
}) => {
  const [assessment, setAssessment] =
    useState<FetchAssessmentTreeResponse["assessmentTree"]>();
  const [fetchMainAssessmentTree, loading] = useFetchAssessmentTree({
    params: {
      callbacks: {
        onSuccess: (response) => {
          setAssessment(response.data?.assessmentTree);
        },
      },
    },
  });

  useEffect(() => {
    if (!selectedAssessment) return;
    void fetchMainAssessmentTree({
      assessmentId: String(selectedAssessment?.id),
    });
  }, [selectedAssessment, fetchMainAssessmentTree]);
  return (
    <CDialog
      open={!!selectedAssessment}
      onClose={() => {
        setAssessment(undefined);
        onClose();
      }}
      title={locationName}
      subtitle={
        selectedAssessment?.startDate ?
          dateFormatter.format(new Date(selectedAssessment.startDate))
        : ""
      }
    >
      {loading && <CLinearProgress label="Carregando..." />}
      {assessment && <AssessmentResultViewer assessment={assessment} />}
    </CDialog>
  );
};

export default AssessmentResultViewerDialog;
