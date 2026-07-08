import { saveCityDataSchema } from "@/lib/serverFunctions/apiCalls/cityParamsSchemas";
import { _saveCity } from "@/lib/serverFunctions/serverActions/city";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = saveCityDataSchema.parse(await request.formData());
  return responseFromResult(await _saveCity(data));
}
