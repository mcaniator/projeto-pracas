import { fetchModularTallyUsers } from "@/lib/serverFunctions/queries/modularTally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function GET() {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para consultar responsáveis!", {
      status: 401,
    });
  }

  try {
    const response = await fetchModularTallyUsers({});

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao consultar responsáveis!", { status: 500 });
  }
}
