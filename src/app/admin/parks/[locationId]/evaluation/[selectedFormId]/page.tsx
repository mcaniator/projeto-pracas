import { validateRequest } from "@/lib/lucia";
import { fetchAssessmentsInProgresss } from "@/serverActions/assessmentUtil";
import { searchformNameById } from "@/serverActions/formUtil";
import { searchLocationNameById } from "@/serverActions/locationUtil";
import { redirect } from "next/navigation";

import AssessmentsClient from "./assessmentsClient";

const AssessmentPage = async ({
  params,
}: {
  params: { locationId: string; selectedFormId: string };
}) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");
  const assessments = await fetchAssessmentsInProgresss(
    Number(params.locationId),
    Number(params.selectedFormId),
  );
  const locationName = await searchLocationNameById(Number(params.locationId));
  const formName =
    (await searchformNameById(Number(params.selectedFormId))) || "ERRO";
  return (
    <AssessmentsClient
      locationId={Number(params.locationId)}
      locationName={locationName}
      userId={user.id}
      formId={Number(params.selectedFormId)}
      formName={formName}
      assessments={assessments}
    />
  );
};

export default AssessmentPage;
