import { exportIndividualTallysToCSVDataSchema } from "@/lib/serverFunctions/apiCalls/exportParamsSchemas";
import { _exportIndividualTallysToCSV } from "@/lib/serverFunctions/serverActions/exportToCSV";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = exportIndividualTallysToCSVDataSchema.parse(
    await request.json(),
  );
  return responseFromResult(await _exportIndividualTallysToCSV(data.tallysIds));
}
