import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fetchAssessments } from "../../../../lib/serverFunctions/queries/assessment";
import { parseQueryParams } from "../../../../lib/utils/apiCall";

const paramsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  formId: z.coerce.number().optional(),
  userId: z.string().optional(),
  locationId: z.coerce.number().optional(),
  narrowUnitId: z.coerce.number().optional(),
  intermediateUnitId: z.coerce.number().optional(),
  broadUnitId: z.coerce.number().optional(),
  cityId: z.coerce.number().optional(),
  finalizationStatus: z.coerce.number().optional(),
});

export type FetchAssessmentsParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const assessments = await fetchAssessments(params);
    return new Response(JSON.stringify(assessments), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching assessments", { status: 500 });
  }
}
