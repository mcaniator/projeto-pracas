import { fetchAssessmentsForAssessmentList } from "@/serverActions/assessmentUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";

import { AssessmentsListPage } from "./assessmentsListPage";

const AssessmentsPage = async ({
  params,
}: {
  params: { locationId: string; selectedFormId: string };
}) => {
  const locatioName = await searchLocationNameById(Number(params.locationId));
  const assessments = await fetchAssessmentsForAssessmentList(
    Number(params.locationId),
    Number(params.selectedFormId),
  );
  assessments.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  return (
    <AssessmentsListPage
      locationId={Number(params.locationId)}
      locationName={locatioName}
      formId={Number(params.selectedFormId)}
      assessments={assessments}
    />
  );
};

export default AssessmentsPage;
