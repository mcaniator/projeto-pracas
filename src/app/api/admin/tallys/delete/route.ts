import { deleteTallyDataSchema } from "@/lib/serverFunctions/apiCalls/tallyParamsSchemas";
import { _deleteTally } from "@/lib/serverFunctions/serverActions/tallyUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteTallyDataSchema.parse(await request.json());
  return responseFromResult(await _deleteTally(data));
}
