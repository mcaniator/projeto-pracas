import { saveAdministrativeUnitDataSchema } from "@/lib/serverFunctions/apiCalls/administrativeUnitParamsSchemas";
import { _saveAdministrativeUnit } from "@/lib/serverFunctions/serverActions/administrativeUnit";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = saveAdministrativeUnitDataSchema.parse(await request.formData());
  return responseFromResult(await _saveAdministrativeUnit(data));
}
