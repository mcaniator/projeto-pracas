import { fetchAssessmentsParamsSchema } from "@/lib/serverFunctions/apiCalls/assessmentParamsSchemas";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

import { fetchAssessments } from "../../../../lib/serverFunctions/queries/assessment";
import { parseQueryParams } from "../../../../lib/utils/apiCall";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(fetchAssessmentsParamsSchema, searchParams);
    const assessments = await fetchAssessments(params);
    return new Response(JSON.stringify(assessments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=5",
      },
    });
  } catch (error) {
    return new Response("Error fetching assessments", { status: 500 });
  }
}
