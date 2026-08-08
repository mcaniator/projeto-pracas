import {
  _createTallyV2,
  createTallyDataSchema,
} from "@/lib/serverFunctions/mutations/tallyUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roles: ["TALLY_EDITOR", "TALLY_MANAGER"],
      });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const data = createTallyDataSchema.parse(await request.formData());
    const result = await _createTallyV2(data);
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
