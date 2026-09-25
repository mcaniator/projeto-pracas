import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchAssessmentDetails } from "@/lib/serverFunctions/apiCalls/assessment";
import {
  FetchPublicAssessmentsResponse,
  GetPublicAssessmentDetailsResponse,
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
    useState<GetPublicAssessmentDetailsResponse["assessmentDetails"]>();
  const [fetchAssessmentDetails, loading] = useFetchAssessmentDetails({
    params: {
      callbacks: {
        onSuccess: (response) => {
          setAssessment(response.data?.assessmentDetails);
        },
      },
    },
  });

  useEffect(() => {
    if (!selectedAssessment) return;
    void fetchAssessmentDetails({
      params: {
        assessmentId: selectedAssessment?.id,
      },
    });
  }, [selectedAssessment, fetchAssessmentDetails]);
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
