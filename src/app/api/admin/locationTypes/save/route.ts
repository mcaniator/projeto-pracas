import { saveLocationTypeDataSchema } from "@/lib/serverFunctions/apiCalls/locationTypeParamsSchemas";
import { _saveLocationType } from "@/lib/serverFunctions/serverActions/locationType";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = saveLocationTypeDataSchema.parse(await request.formData());
  return responseFromResult(await _saveLocationType(data));
}
