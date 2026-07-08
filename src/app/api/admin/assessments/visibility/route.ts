import { updateAssessmentVisibilityDataSchema } from "@/lib/serverFunctions/apiCalls/assessmentParamsSchemas";
import { _updateAssessmentVisibility } from "@/lib/serverFunctions/serverActions/assessmentUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = updateAssessmentVisibilityDataSchema.parse(await request.json());
  return responseFromResult(await _updateAssessmentVisibility(data));
}
