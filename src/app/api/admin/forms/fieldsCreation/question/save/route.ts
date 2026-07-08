import { questionSubmitDataSchema } from "@/lib/serverFunctions/apiCalls/questionParamsSchemas";
import { _questionSubmit } from "@/lib/serverFunctions/serverActions/questionUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = questionSubmitDataSchema.parse(await request.formData());
  return responseFromResult(await _questionSubmit(data));
}
