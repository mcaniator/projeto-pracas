import { deleteCategoryDataSchema } from "@/lib/serverFunctions/apiCalls/categoryParamsSchemas";
import { _deleteCategory } from "@/lib/serverFunctions/serverActions/categoryServerActions";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteCategoryDataSchema.parse(await request.formData());
  return responseFromResult(await _deleteCategory(data));
}
