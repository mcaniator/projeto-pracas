import CLinearProgress from "@/components/ui/CLinearProgress";
import CDialog from "@/components/ui/dialog/cDialog";
import FormSubmissionViewer from "@/components/ui/formSubmissionViewer/formSubmissionViewer";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { useFetchAssessmentDetails } from "@/lib/serverFunctions/apiCalls/assessment";
import { FetchAssessmentDetailsResponse } from "@/lib/serverFunctions/queries/assessment";
import { IconEye } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const AssessmentResultDialog = ({
  assessment,
  open,
  isSQLiteAssessment,
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
  isSQLiteAssessment: boolean;
  onClose: () => void;
}) => {
  const [assessmentDetails, setAssessmentDetails] =
    useState<FetchAssessmentDetailsResponse["assessmentDetails"]>();
  const [fetchAssessmentDetails, loading] = useFetchAssessmentDetails({
    params: {
      callbacks: {
        onSuccess: (response) => {
          setAssessmentDetails(response.data?.assessmentDetails);
        },
      },
    },
  });
  useEffect(() => {
    if (!assessment) return;
    void fetchAssessmentDetails({
      params: {
        assessmentId: assessment.id,
      },
    });
  }, [assessment, fetchAssessmentDetails]);
  if (!assessment) {
    return null;
  }
  return (
    <CDialog
      open={open}
      onClose={onClose}
      mobileFullScreen
      title={assessment.location.name}
      subtitle={`${dateTimeFormatter.format(assessment.startDate)} ${assessment.endDate ? `- ${dateTimeFormatter.format(assessment.endDate)}` : ""}`}
      confirmChildren={
        <>
          <IconEye />
          Ver preenchimento
        </>
      }
      confirmProps={{
        href: `/admin/assessments/details?assessmentId=${assessment.id}&isSQLiteAssessment=${isSQLiteAssessment}`,
        loadingOnClick: true,
      }}
    >
      {!loading && assessmentDetails && (
        <FormSubmissionViewer
          formSubmission={{
            formStructure: assessmentDetails.formSubmission.formStructure,
            responsesFormValues:
              assessmentDetails.formSubmission.responsesFormValues,
            geometries: assessmentDetails.formSubmission.geometries,
          }}
          locationPolygonGeoJson={assessmentDetails.location.st_asgeojson}
        />
      )}
      {loading && <CLinearProgress label="Carregando..." />}
    </CDialog>
  );
};

export default AssessmentResultDialog;
