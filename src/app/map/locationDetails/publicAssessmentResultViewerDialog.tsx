import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import { dateFormatter } from "@/lib/formatters/dateFormatters";
import { usePublicFetchPublicAssessmentDetails } from "@/lib/serverFunctions/apiCalls/public/assessment";
import {
  PublicFetchPublicAssessmentDetailsResponse,
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
    useState<PublicFetchPublicAssessmentDetailsResponse["assessmentDetails"]>();
  const [fetchAssessmentDetails, loading] =
    usePublicFetchPublicAssessmentDetails({
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

export default PublicAssessmentResultViewerDialog;
