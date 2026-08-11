import { fetchTallyUsers } from "@/lib/serverFunctions/queries/tally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await fetchTallyUsers({});

    return new Response(superjson.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Error fetching users", { status: 500 });
  }
}
