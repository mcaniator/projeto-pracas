import { fetchPublicAssessments } from "@/lib/serverFunctions/queries/assessment";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  locationId: z.coerce.number().optional(),
});

export type FetchPublicAssessmentsParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const assessments = await fetchPublicAssessments(params);
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
