import { getAssessmentTree } from "@/lib/serverFunctions/queries/assessment";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  assessmentId: z.string().min(1),
});

export type FetchAssessmentTreeParams = z.infer<typeof paramsSchema>;

export async function GET(
  request: NextRequest,
  props: {
    params: Promise<FetchAssessmentTreeParams>;
  },
) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const params = await props.params;
    const assessmentId = z.coerce.number().parse(params.assessmentId);
    const assessments = await getAssessmentTree({ assessmentId });
    return new Response(JSON.stringify(assessments), {
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
