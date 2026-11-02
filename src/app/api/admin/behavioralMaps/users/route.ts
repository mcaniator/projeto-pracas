import { fetchBehavioralMapUsers } from "@/lib/serverFunctions/queries/behavioralMap";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function GET() {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
    const result = await fetchBehavioralMapUsers();
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      "Erro ao consultar responsáveis por mapas comportamentais!",
      { status: 500 },
    );
  }
}
