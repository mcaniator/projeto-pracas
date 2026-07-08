import { saveOngoingTallyDataSchema } from "@/lib/serverFunctions/apiCalls/tallyParamsSchemas";
import { _saveOngoingTallyData } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = saveOngoingTallyDataSchema.parse(await request.json());
  return responseFromResult(
    await _saveOngoingTallyData({
      ...data,
      tallyMap: new Map(data.tallyMapEntries),
    } as never),
  );
}
