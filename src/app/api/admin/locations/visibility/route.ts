import { updateLocationVisibilityDataSchema } from "@/lib/serverFunctions/apiCalls/locationParamsSchemas";
import { _updateLocationVisibility } from "@/lib/serverFunctions/serverActions/locationUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = updateLocationVisibilityDataSchema.parse(await request.json());
  return responseFromResult(await _updateLocationVisibility(data));
}
