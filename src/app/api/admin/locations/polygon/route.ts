import { editLocationPolygonDataSchema } from "@/lib/serverFunctions/apiCalls/locationParamsSchemas";
import { _editLocationPolygon } from "@/lib/serverFunctions/serverActions/locationUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = editLocationPolygonDataSchema.parse(await request.json());
  return responseFromResult(await _editLocationPolygon(data));
}
