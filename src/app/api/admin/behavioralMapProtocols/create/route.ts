import { createBehavioralMapProtocol, createBehavioralMapProtocolDataSchema } from "@/lib/serverFunctions/mutations/behavioralMapProtocol";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
  } catch {
    return new Response("Sem permissão para criar protocolos de mapas comportamentais!", { status: 401 });
  }
  try {
    const data = createBehavioralMapProtocolDataSchema.parse(await request.json());
    const response = await createBehavioralMapProtocol({ data });
    return new Response(superjson.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response("Erro ao criar protocolo de mapa comportamental!", { status: 500 });
  }
}
