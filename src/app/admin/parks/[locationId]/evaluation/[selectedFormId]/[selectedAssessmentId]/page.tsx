import { getAssessmentTree } from "@queries/assessment";
import { IconClipboard, IconMapPin } from "@tabler/icons-react";
import { redirect } from "next/navigation";

import { dateTimeFormatter } from "../../../../../../../lib/formatters/dateFormatters";
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
      id: true,
      name: true,
    },
  });
  if (!location || !assessment || !assessment.assessmentTree) {
    redirect("/error");
  }

  return (
    <div className="flex h-full flex-col gap-1 overflow-auto bg-white p-3 text-black">
      <h3 className="flex text-2xl font-semibold">
        <IconMapPin /> {location.name}
      </h3>
      <h3 className="flex text-2xl font-semibold">
        <IconClipboard /> {assessment.assessmentTree.formName}
      </h3>
      <div>
        {`Início: ${dateTimeFormatter.format(assessment.assessmentTree.startDate)}`}
      </div>
      {assessment.assessmentTree.endDate !== null && (
        <div>
          {`Fim: ${dateTimeFormatter.format(assessment.assessmentTree.endDate)}`}
        </div>
      )}

      <ResponseFormV2
        locationId={location.id}
        locationName={location.name}
        assessmentTree={assessment.assessmentTree}
        finalized={assessment.assessmentTree.endDate !== null}
      />
    </div>
  );
};
export default Responses;
