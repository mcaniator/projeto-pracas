import { updateFormDataSchema } from "@/lib/serverFunctions/apiCalls/formParamsSchemas";
import { _updateFormV2 } from "@/lib/serverFunctions/serverActions/formUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = updateFormDataSchema.parse(await request.json());
  return responseFromResult(await _updateFormV2(data as never));
}
