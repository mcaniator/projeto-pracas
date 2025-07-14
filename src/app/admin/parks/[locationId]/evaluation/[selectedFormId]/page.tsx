import { fetchAssessmentsInProgress } from "@queries/assessment";
import { searchformNameById } from "@queries/form";
import { searchLocationNameById } from "@queries/location";

import AssessmentsInProgressPage from "./assessmentsInProgressPage";

const AssessmentPage = async (props: {
  params: Promise<{ locationId: string; selectedFormId: string }>;
}) => {
  const params = await props.params;

  const locationId = Number(params.locationId);
  const formId = Number(params.selectedFormId);
  const assessments = await fetchAssessmentsInProgress(locationId, formId);
  const { locationName } = await searchLocationNameById(
    Number(params.locationId),
  );
  const { formName } =
    (await searchformNameById(Number(params.selectedFormId))) || "ERRO";
  return (
    <AssessmentsInProgressPage
      formId={formId}
      locationId={locationId}
      locationName={locationName ?? "[ERRO]"}
      formName={formName ?? "[Erro ao obter nome]"}
      assessments={assessments}
    />
  );
};

export default AssessmentPage;
