import { updateLocationDataSchema } from "@/lib/serverFunctions/apiCalls/locationParamsSchemas";
import { _updateLocation } from "@/lib/serverFunctions/serverActions/locationUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = updateLocationDataSchema.parse(await request.formData());
  return responseFromResult(await _updateLocation(data));
}
