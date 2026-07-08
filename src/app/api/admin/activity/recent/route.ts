import { fetchRecentlyCompletedAssessments } from "@/lib/serverFunctions/queries/assessment";
import { fetchRecentlyCompletedTallys } from "@/lib/serverFunctions/queries/tally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function GET() {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roleGroups: ["ASSESSMENT", "TALLY"],
    });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [assessments, tallys] = await Promise.all([
    fetchRecentlyCompletedAssessments(),
    fetchRecentlyCompletedTallys(),
  ]);

  return Response.json({
    responseInfo: {
      statusCode:
        assessments.responseInfo.statusCode === 200 &&
        tallys.responseInfo.statusCode === 200 ?
          200
        : 500,
    },
    data: {
      assessments: assessments.data.assessments,
      tallys: tallys.data.tallys,
    },
  });
}
