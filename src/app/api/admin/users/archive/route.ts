import { updateUserArchiveDataSchema } from "@/lib/serverFunctions/apiCalls/userParamsSchemas";
import { _userArchiveUpdate } from "@/lib/serverFunctions/serverActions/userUtil";
import { responseFromResult } from "@/lib/utils/apiRouteResponse";

export async function POST(request: Request) {
  const data = updateUserArchiveDataSchema.parse(await request.json());
  return responseFromResult(await _userArchiveUpdate(data));
}
