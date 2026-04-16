import CLinearProgress from "@/components/ui/CLinearProgress";
import CAssessmentResultViewer from "@/components/ui/assessment/assessmentResultViewer";
import CDialog from "@/components/ui/dialog/cDialog";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchPublicAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import {
  FetchPublicAssessmentTreeResponse,
  FetchPublicAssessmentsResponse,
} from "@/lib/serverFunctions/queries/assessment";
import { useEffect, useState } from "react";

const CPublicAssessmentResultViewerDialog = ({
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
    useState<FetchPublicAssessmentTreeResponse["assessmentTree"]>();
  const [fetchAssessmentTree, loading] = useFetchPublicAssessmentTree({
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
      {assessment && <CAssessmentResultViewer assessment={assessment} />}
    </CDialog>
  );
};

export default CPublicAssessmentResultViewerDialog;
