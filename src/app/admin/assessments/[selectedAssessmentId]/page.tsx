import AssessmentClient from "@/app/admin/assessments/[selectedAssessmentId]/assessmentClient";
import { auth } from "@/lib/auth/auth";
import { getUserAuthInfo } from "@/lib/serverFunctions/queries/user";
import { fetchAssessmentTree } from "@queries/assessment";
import { redirect } from "next/navigation";

const Responses = async (props: {
  params: Promise<{
    selectedAssessmentId: string;
  }>;
}) => {
  const params = await props.params;

  const assessment = await fetchAssessmentTree({
    assessmentId: Number(params.selectedAssessmentId),
  });
  if (!assessment || !assessment.data?.assessmentTree) redirect("/error");
  const location = assessment.data.assessmentTree?.location;
  if (!location) {
    redirect("/error");
  }
  const session = await auth();
  const user = await getUserAuthInfo(session?.user?.id);
  if (!user) {
    redirect("/error");
  }
  let userCanEdit = false;
  if (assessment.data.assessmentTree.user.id === user.id) {
    userCanEdit = true;
  } else if (user.roles.includes("ASSESSMENT_MANAGER")) {
    userCanEdit = true;
  }

  return (
    <AssessmentClient
      locationId={location.id}
      locationName={location.name}
      locationPolygonGeoJson={location.st_asgeojson}
      assessmentTree={assessment.data.assessmentTree}
      finalized={assessment.data.assessmentTree.isFinalized}
      userCanEdit={userCanEdit}
    />
  );
};
export default Responses;
