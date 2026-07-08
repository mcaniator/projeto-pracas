import { deleteLocationDataSchema } from "@/lib/serverFunctions/apiCalls/locationParamsSchemas";
import { _deleteLocation } from "@/lib/serverFunctions/serverActions/locationUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteLocationDataSchema.parse(await request.formData());
  return responseFromResult(await _deleteLocation(data));
}
