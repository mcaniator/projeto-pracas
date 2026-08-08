import { fetchPublicAssessmentsParamsSchema } from "@/lib/serverFunctions/queries/assessment";
import { fetchPublicAssessments } from "@/lib/serverFunctions/queries/assessment";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(
      fetchPublicAssessmentsParamsSchema,
      searchParams,
    );
    const assessments = await fetchPublicAssessments(params);
    return new Response(superjson.stringify(assessments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=10",
      },
    });
  } catch (error) {
    return new Response("Error fetching assessments", { status: 500 });
  }
}
