import {
  publicFetchPublicAssessmentTree,
  publicFetchPublicAssessmentTreeParamsSchema,
} from "@/lib/serverFunctions/queries/public/assessment";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(
      publicFetchPublicAssessmentTreeParamsSchema,
      request.nextUrl.searchParams,
    );
    const assessments = await publicFetchPublicAssessmentTree({ params });
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
