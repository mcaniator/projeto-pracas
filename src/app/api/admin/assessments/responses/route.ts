import {
  _addResponsesV2,
  addResponsesDataSchema,
} from "@/lib/serverFunctions/mutations/responseUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roleGroups: ["ASSESSMENT"],
      });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const data = addResponsesDataSchema.parse(await request.json());
    const result = await _addResponsesV2(data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
