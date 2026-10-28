import {
  updateTallyProtocolArchiveStatus,
  updateTallyProtocolArchiveStatusDataSchema,
} from "@/lib/serverFunctions/mutations/tally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
  } catch {
    return new Response("Sem permissão para alterar protocolos de contagem!", {
      status: 401,
    });
  }

  try {
    const data = updateTallyProtocolArchiveStatusDataSchema.parse(
      await request.json(),
    );
    const response = await updateTallyProtocolArchiveStatus({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao atualizar protocolo de contagem!", {
      status: 500,
    });
  }
}
