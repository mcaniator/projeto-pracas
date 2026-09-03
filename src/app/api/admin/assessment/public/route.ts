import {
  fetchAssessmentTree,
  fetchAssessmentTreeParamsSchema,
} from "@/lib/serverFunctions/queries/assessment";
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
    const params = parseQueryParams(
      fetchAssessmentTreeParamsSchema,
      request.nextUrl.searchParams,
    );
    const assessments = await fetchAssessmentTree({
      params: {
        ...params,
        isPublic: true,
      },
    });
    return new Response(superjson.stringify(assessments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return new Response("Error fetching assessments", { status: 500 });
  }
}
