import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchAssessmentTree } from "@/lib/serverFunctions/apiCalls/assessment";
import {
  FetchPublicAssessmentsResponse,
  GetPublicAssessmentTreeResponse,
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
    useState<GetPublicAssessmentTreeResponse["assessmentTree"]>();
  const [fetchAssessmentTree, loading] = useFetchAssessmentTree({
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
      params: {
        assessmentId: selectedAssessment?.id,
      },
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
          dateFormatter.format(selectedAssessment.startDate)
        : ""
      }
    >
      {loading && <CLinearProgress label="Carregando..." />}
      {assessment && (
        <FormSubmissionViewer
          formSubmission={{
            formStructure: assessment.formSubmission.formStructure,
            responsesFormValues: assessment.formSubmission.responsesFormValues,
            geometries: assessment.formSubmission.geometries,
          }}
          locationPolygonGeoJson={assessment.location.st_asgeojson}
        />
      )}
    </CDialog>
  );
};

export default CPublicAssessmentResultViewerDialog;
