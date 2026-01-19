import { auth } from "@/lib/auth/auth";
import { dateTimeFormatter } from "@/lib/formatters/dateFormatters";
import { getUserAuthInfo } from "@/lib/serverFunctions/queries/user";
import { getAssessmentTree } from "@queries/assessment";
import { IconClipboard, IconMapPin, IconUser } from "@tabler/icons-react";
import { redirect } from "next/navigation";

import ResponseFormV2 from "./responseFormV2";

const Responses = async (props: {
  params: Promise<{
    selectedAssessmentId: string;
  }>;
}) => {
  const params = await props.params;

  const assessment = await getAssessmentTree({
    assessmentId: Number(params.selectedAssessmentId),
  });
  if (!assessment || !assessment.assessmentTree) redirect("/error");
  const location = assessment.assessmentTree?.location;
  if (!location) {
    redirect("/error");
  }
  const session = await auth();
  const user = await getUserAuthInfo(session?.user?.id);
  if (!user) {
    redirect("/error");
  }
  let userCanEdit = false;
  if (assessment.assessmentTree.user.id === user.id) {
    userCanEdit = true;
  } else if (user.roles.includes("ASSESSMENT_MANAGER")) {
    userCanEdit = true;
  }

  return (
    <div className="flex h-full flex-col gap-1 overflow-auto bg-white p-3 text-black">
      <h3 className="flex text-2xl font-semibold">
        <IconMapPin /> {location.name}
      </h3>
      <h3 className="flex text-2xl font-semibold">
        <IconClipboard /> {assessment.assessmentTree.formName}
      </h3>
      <h3 className="flex text-2xl font-semibold">
        <IconUser /> {assessment.assessmentTree.user.username}
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
        userCanEdit={userCanEdit}
      />
    </div>
  );
};
export default Responses;
