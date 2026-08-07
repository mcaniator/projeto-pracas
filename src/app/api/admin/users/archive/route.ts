import {
  _userArchiveUpdate,
  updateUserArchiveDataSchema,
} from "@/lib/serverFunctions/mutations/userUtil";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roles: ["USER_MANAGER"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const data = updateUserArchiveDataSchema.parse(await request.json());
    const result = await _userArchiveUpdate(data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
