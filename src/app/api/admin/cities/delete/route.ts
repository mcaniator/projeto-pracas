import { deleteCityDataSchema } from "@/lib/serverFunctions/apiCalls/cityParamsSchemas";
import { _deleteCity } from "@/lib/serverFunctions/serverActions/city";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteCityDataSchema.parse(await request.formData());
  return responseFromResult(await _deleteCity(data));
}
