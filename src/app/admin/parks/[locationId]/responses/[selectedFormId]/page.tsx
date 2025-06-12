import { fetchAssessmentByLocationAndForm } from "@/serverActions/assessmentUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";

import { AssessmentsListPage } from "./assessmentsListPage";

const AssessmentsPage = async (props: {
  params: Promise<{ locationId: string; selectedFormId: string }>;
}) => {
  const params = await props.params;
  const { locationName } = await searchLocationNameById(
    Number(params.locationId),
  );
  const assessments = await fetchAssessmentByLocationAndForm(
    Number(params.locationId),
    Number(params.selectedFormId),
  );
  assessments.assessments.sort(
    (a, b) => b.startDate.getTime() - a.startDate.getTime(),
  );
  return (
    <AssessmentsListPage
      locationId={Number(params.locationId)}
      locationName={locationName ?? "[ERRO]"}
      formId={Number(params.selectedFormId)}
      assessments={assessments}
    />
  );
};

export default AssessmentsPage;
