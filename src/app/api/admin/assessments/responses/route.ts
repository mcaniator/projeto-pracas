import { addResponsesDataSchema } from "@/lib/serverFunctions/apiCalls/assessmentParamsSchemas";
import { _addResponsesV2 } from "@/lib/serverFunctions/serverActions/responseUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = addResponsesDataSchema.parse(await request.json());
  return responseFromResult(await _addResponsesV2(data as never)); //TODO: FIX TYPE
}
