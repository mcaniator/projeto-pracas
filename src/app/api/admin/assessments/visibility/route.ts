import {
  _updateAssessmentVisibility,
  updateAssessmentVisibilityDataSchema,
} from "@/lib/serverFunctions/mutations/assessmentUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roles: ["ASSESSMENT_MANAGER"],
      });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const data = updateAssessmentVisibilityDataSchema.parse(
      await request.json(),
    );
    const result = await _updateAssessmentVisibility(data);
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
