import { updateUserRolesDataSchema } from "@/lib/serverFunctions/apiCalls/userParamsSchemas";
import { _updateUserRolesV2 } from "@/lib/serverFunctions/serverActions/userUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = updateUserRolesDataSchema.parse(await request.json());
  return responseFromResult(await _updateUserRolesV2(data));
}
