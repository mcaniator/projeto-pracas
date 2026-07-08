import { deleteInviteDataSchema } from "@/lib/serverFunctions/apiCalls/inviteParamsSchemas";
import { _deleteInviteV2 } from "@/lib/serverFunctions/serverActions/inviteUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = deleteInviteDataSchema.parse(await request.json());
  return responseFromResult(await _deleteInviteV2(data));
}
