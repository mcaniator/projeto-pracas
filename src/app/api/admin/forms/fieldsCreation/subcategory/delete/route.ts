import { deleteSubcategoryDataSchema } from "@/lib/serverFunctions/apiCalls/categoryParamsSchemas";
import { _deleteSubcategory } from "@/lib/serverFunctions/serverActions/categoryServerActions";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteSubcategoryDataSchema.parse(await request.formData());
  return responseFromResult(await _deleteSubcategory(data));
}
