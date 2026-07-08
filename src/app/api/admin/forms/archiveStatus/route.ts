import { updateFormArchiveStatusDataSchema } from "@/lib/serverFunctions/apiCalls/formParamsSchemas";
import { _updateFormArchiveStatus } from "@/lib/serverFunctions/serverActions/formUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = updateFormArchiveStatusDataSchema.parse(
    await request.formData(),
  );
  return responseFromResult(await _updateFormArchiveStatus(data));
}
