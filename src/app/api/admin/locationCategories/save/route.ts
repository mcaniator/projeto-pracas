import { saveLocationCategoryDataSchema } from "@/lib/serverFunctions/apiCalls/locationCategoryParamsSchemas";
import { _saveLocationCategory } from "@/lib/serverFunctions/serverActions/locationCategory";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = saveLocationCategoryDataSchema.parse(await request.formData());
  return responseFromResult(await _saveLocationCategory(data));
}
