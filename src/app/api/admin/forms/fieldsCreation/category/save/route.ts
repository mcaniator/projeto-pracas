import { categorySubmitDataSchema } from "@/lib/serverFunctions/apiCalls/categoryParamsSchemas";
import { _categorySubmit } from "@/lib/serverFunctions/serverActions/categoryServerActions";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = categorySubmitDataSchema.parse(await request.formData());
  return responseFromResult(await _categorySubmit(data));
}
