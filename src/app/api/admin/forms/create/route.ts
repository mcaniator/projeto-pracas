import { createFormDataSchema } from "@/lib/serverFunctions/apiCalls/formParamsSchemas";
import { _createForm } from "@/lib/serverFunctions/serverActions/formUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = createFormDataSchema.parse(await request.formData());
  return responseFromResult(await _createForm(data));
}
