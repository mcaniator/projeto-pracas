import { publicFetchPublicAssessmentsParamsSchema } from "@/lib/serverFunctions/apiCalls/public/assessmentParamsSchemas";
import { publicFetchPublicAssessments } from "@/lib/serverFunctions/queries/public/assessment";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(
      publicFetchPublicAssessmentsParamsSchema,
      searchParams,
    );
    const assessments = await publicFetchPublicAssessments(params);
    return new Response(JSON.stringify(assessments), {
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
