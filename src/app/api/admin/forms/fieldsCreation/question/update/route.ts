import { questionUpdateDataSchema } from "@/lib/serverFunctions/apiCalls/questionParamsSchemas";
import { _questionUpdate } from "@/lib/serverFunctions/serverActions/questionUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = questionUpdateDataSchema.parse(await request.formData());
  return responseFromResult(await _questionUpdate(data));
}
