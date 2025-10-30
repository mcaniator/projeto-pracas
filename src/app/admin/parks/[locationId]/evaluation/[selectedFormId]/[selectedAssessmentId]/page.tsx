import { getAssessmentTree } from "@queries/assessment";
import { redirect } from "next/navigation";

import { prisma } from "../../../../../../../lib/prisma";
import ResponseFormV2 from "./responseFormV2";

const Responses = async (props: {
  params: Promise<{
    locationId: string;
    selectedFormId: string;
    selectedAssessmentId: string;
  }>;
}) => {
  const params = await props.params;

  const assessment = await getAssessmentTree({
    assessmentId: Number(params.selectedAssessmentId),
  });

  const location = await prisma.location.findUnique({
    where: {
      id: Number(params.locationId),
    },
    select: {
      name: true,
    },
  });

  if (!location || !assessment || !assessment.assessmentTree) {
    redirect("/error");
  }

  return (
    <div className="flex h-full flex-col gap-1 overflow-auto bg-white p-3">
      <h3 className="flex flex-col gap-5 text-2xl font-semibold text-black">
        Avaliando: {location.name} com o formulário:{" "}
        {assessment.assessmentTree.formName}
      </h3>
      <ResponseFormV2
        locationName={location.name}
        assessmentTree={assessment.assessmentTree}
      />
    </div>
  );

  /*return (
    <ResponseComponent
      assessment={response.assessment}
      locationId={Number(params.locationId)}
      initialGeometries={response.geometries}
      formName={response.assessment?.form?.name ?? "(formulário desconhecido)"}
    />
  );*/
};
export default Responses;
