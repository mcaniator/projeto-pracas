import {
  _createAssessmentV2,
  createAssessmentDataSchema,
} from "@/lib/serverFunctions/mutations/assessmentUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roles: ["ASSESSMENT_EDITOR", "ASSESSMENT_MANAGER"],
      });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const data = createAssessmentDataSchema.parse(await request.formData());
    const result = await _createAssessmentV2(data);
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
