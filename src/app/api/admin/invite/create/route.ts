import { createInviteDataSchema } from "@/lib/serverFunctions/apiCalls/inviteParamsSchemas";
import { _createInviteV2 } from "@/lib/serverFunctions/serverActions/inviteUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = createInviteDataSchema.parse(await request.json());
  return responseFromResult(await _createInviteV2(data));
}
