import { fetchUsers } from "@queries/user";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["USER"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const users = await fetchUsers({});
    return new Response(superjson.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching users", { status: 500 });
  }
}
