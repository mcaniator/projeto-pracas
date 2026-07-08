import { deleteLocationCategoryOrTypeDataSchema } from "@/lib/serverFunctions/apiCalls/locationCategoryParamsSchemas";
import { _deleteLocationCategoryOrType } from "@/lib/serverFunctions/serverActions/locationCategory";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteLocationCategoryOrTypeDataSchema.parse(
    await request.formData(),
  );
  return responseFromResult(await _deleteLocationCategoryOrType(data));
}
