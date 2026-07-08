import { exportAssessmentsDataSchema } from "@/lib/serverFunctions/apiCalls/exportParamsSchemas";
import { _exportAssessments } from "@/lib/serverFunctions/serverActions/exportToCSV";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = exportAssessmentsDataSchema.parse(await request.json());
  return responseFromResult(await _exportAssessments(data.assessmentIds));
}
