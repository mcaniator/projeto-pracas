import { exportDailyTallysDataSchema } from "@/lib/serverFunctions/apiCalls/exportParamsSchemas";
import { _exportDailyTallys } from "@/lib/serverFunctions/serverActions/exportToCSV";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = exportDailyTallysDataSchema.parse(await request.json());
  return responseFromResult(
    await _exportDailyTallys(data.locationIds, data.tallysIds),
  );
}
