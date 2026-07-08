import { subcategorySubmitDataSchema } from "@/lib/serverFunctions/apiCalls/categoryParamsSchemas";
import { _subcategorySubmit } from "@/lib/serverFunctions/serverActions/categoryServerActions";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = subcategorySubmitDataSchema.parse(await request.formData());
  return responseFromResult(await _subcategorySubmit(data));
}
