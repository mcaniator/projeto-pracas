import { fetchAssessmentsInProgresss } from "@/serverActions/assessmentUtil";
import { searchformNameById } from "@/serverActions/formUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { redirect } from "next/navigation";

import AssessmentsInProgressPage from "./assessmentsInProgressPage";

interface AssessmentDataFetchedToAssessmentList {
  id: number;
  startDate: Date;
  user: {
    username: string;
  };
}

const AssessmentPage = async (
  props: {
    params: Promise<{ locationId: string; selectedFormId: string }>;
  }
) => {
  const params = await props.params;
  const user = null;
  if (user === null || user.type !== "ADMIN") redirect("/error");

  const locationId = Number(params.locationId);
  const formId = Number(params.selectedFormId);
  const assessments = await fetchAssessmentsInProgresss(locationId, formId);
  const locationName = await searchLocationNameById(Number(params.locationId));
  const formName =
    (await searchformNameById(Number(params.selectedFormId))) || "ERRO";
  return (
    <AssessmentsInProgressPage
      formId={formId}
      locationId={locationId}
      userId={user.id}
      locationName={locationName}
      formName={formName}
      assessments={assessments}
    />
  );
};

export default AssessmentPage;

export { type AssessmentDataFetchedToAssessmentList };
