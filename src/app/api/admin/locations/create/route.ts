import { createLocationDataSchema } from "@/lib/serverFunctions/apiCalls/locationParamsSchemas";
import { _createLocation } from "@/lib/serverFunctions/serverActions/locationUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = createLocationDataSchema.parse(await request.formData());
  return responseFromResult(await _createLocation(data));
}
