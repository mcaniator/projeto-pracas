import { exportRegistrationDataSchema } from "@/lib/serverFunctions/apiCalls/exportParamsSchemas";
import { _exportRegistrationData } from "@/lib/serverFunctions/serverActions/exportToCSV";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = exportRegistrationDataSchema.parse(await request.json());
  return responseFromResult(await _exportRegistrationData(data.locationsIds));
}
