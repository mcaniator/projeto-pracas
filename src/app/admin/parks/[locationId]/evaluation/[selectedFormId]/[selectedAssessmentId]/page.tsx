import { fetchAssessmentWithResponses } from "@/serverActions/assessmentUtil";
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

  const assessment = await fetchAssessmentWithResponses(
    Number(params.selectedAssessmentId),
  );

  if (!assessment) {
    redirect("/error");
  }

  return (
    <ResponseComponent
      assessment={assessment}
      locationId={Number(params.locationId)}
      initialGeometries={assessment.geometries}
      formName={assessment?.form?.name ?? "(formulário desconhecido)"}
    />
  );
};
export default Responses;
