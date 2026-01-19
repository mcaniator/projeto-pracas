import { fetchInvites } from "@/lib/serverFunctions/queries/invite";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["USER"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const users = await fetchInvites();
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching users", { status: 500 });
  }
}
