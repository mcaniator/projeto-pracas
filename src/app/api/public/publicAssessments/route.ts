import { publicFetchPublicAssessments } from "@/lib/serverFunctions/queries/public/assessment";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  locationId: z.coerce.number().optional(),
});

export type PublicFetchPublicAssessmentsParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
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
