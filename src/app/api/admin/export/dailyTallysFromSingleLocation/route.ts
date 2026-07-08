import { exportDailyTallysFromSingleLocationDataSchema } from "@/lib/serverFunctions/apiCalls/exportParamsSchemas";
import { _exportDailyTallysFromSingleLocation } from "@/lib/serverFunctions/serverActions/exportToCSV";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = exportDailyTallysFromSingleLocationDataSchema.parse(
    await request.json(),
  );
  return responseFromResult(
    await _exportDailyTallysFromSingleLocation(data.tallysIds),
  );
}
