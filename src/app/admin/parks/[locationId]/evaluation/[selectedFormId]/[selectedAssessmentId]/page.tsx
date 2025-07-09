import { fetchAssessmentWithResponses } from "@serverActions/assessmentUtil";
import { redirect } from "next/navigation";

import { ResponseComponent } from "./responseComponent";

const Responses = async (props: {
  params: Promise<{
    locationId: string;
    selectedFormId: string;
    selectedAssessmentId: string;
  }>;
}) => {
  const params = await props.params;

  const response = await fetchAssessmentWithResponses(
    Number(params.selectedAssessmentId),
  );

  if (!response || !response.assessment) {
    redirect("/error");
  }

  return (
    <ResponseComponent
      assessment={response.assessment}
      locationId={Number(params.locationId)}
      initialGeometries={response.geometries}
      formName={response.assessment?.form?.name ?? "(formulário desconhecido)"}
    />
  );
};
export default Responses;
