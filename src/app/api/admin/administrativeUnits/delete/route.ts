import { deleteAdministrativeUnitDataSchema } from "@/lib/serverFunctions/apiCalls/administrativeUnitParamsSchemas";
import { _deleteAdministrativeUnit } from "@/lib/serverFunctions/serverActions/administrativeUnit";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteAdministrativeUnitDataSchema.parse(
    await request.formData(),
  );
  return responseFromResult(await _deleteAdministrativeUnit(data));
}
