import { deleteAssessmentDataSchema } from "@/lib/serverFunctions/apiCalls/assessmentParamsSchemas";
import { _deleteAssessment } from "@/lib/serverFunctions/serverActions/assessmentUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteAssessmentDataSchema.parse(await request.json());
  return responseFromResult(await _deleteAssessment(data.assessmentId));
}
