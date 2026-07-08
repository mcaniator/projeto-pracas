import { createTallyDataSchema } from "@/lib/serverFunctions/apiCalls/tallyParamsSchemas";
import { _createTallyV2 } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = createTallyDataSchema.parse(await request.formData());
  return responseFromResult(await _createTallyV2(data));
}
