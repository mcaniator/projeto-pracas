import { createAssessmentDataSchema } from "@/lib/serverFunctions/apiCalls/assessmentParamsSchemas";
import { _createAssessmentV2 } from "@/lib/serverFunctions/serverActions/assessmentUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = createAssessmentDataSchema.parse(await request.formData());
  return responseFromResult(await _createAssessmentV2(data));
}
