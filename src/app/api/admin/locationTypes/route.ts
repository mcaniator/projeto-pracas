import { fetchLocationTypes } from "@/lib/serverFunctions/queries/locationType";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const locations = await fetchLocationTypes({});
    return new Response(superjson.stringify(locations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return new Response("Erro cao buscar tipos de praças!", {
      status: 500,
    });
  }
}
