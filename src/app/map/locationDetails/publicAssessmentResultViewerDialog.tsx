import CLinearProgress from "@/components/ui/CLinearProgress";
import AssessmentResultViewer from "@/components/ui/assessment/assessmentResultViewer";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { usePublicFetchPublicAssessmentTree } from "@/lib/serverFunctions/apiCalls/public/assessment";
import {
  PublicFetchPublicAssessmentTreeResponse,
  PublicFetchPublicAssessmentsResponse,
} from "@/lib/serverFunctions/queries/public/assessment";
import { useEffect, useState } from "react";

const PublicAssessmentResultViewerDialog = ({
  selectedAssessment,
  locationName,
  onClose,
}: {
  selectedAssessment:
    | PublicFetchPublicAssessmentsResponse["assessments"][number]
    | null;
  locationName: string;
  onClose: () => void;
}) => {
  const [assessment, setAssessment] =
    useState<PublicFetchPublicAssessmentTreeResponse["assessmentTree"]>();
  const [fetchAssessmentTree, loading] = usePublicFetchPublicAssessmentTree({
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
    void fetchAssessmentTree({
      assessmentId: String(selectedAssessment?.id),
    });
  }, [selectedAssessment, fetchAssessmentTree]);
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

export default PublicAssessmentResultViewerDialog;
