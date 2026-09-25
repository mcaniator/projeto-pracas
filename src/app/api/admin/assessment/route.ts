import {
  fetchAssessmentDetails,
  fetchAssessmentDetailsParamsSchema,
} from "@/lib/serverFunctions/queries/assessment";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const params = parseQueryParams(
      fetchAssessmentDetailsParamsSchema,
      request.nextUrl.searchParams,
    );
    const assessments = await fetchAssessmentDetails({ params });
    return new Response(superjson.stringify(assessments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    return new Response("Error ao buscar avaliação", { status: 500 });
  }
}
