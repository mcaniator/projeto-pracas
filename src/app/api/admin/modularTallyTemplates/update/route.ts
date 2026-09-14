import {
  updateTallyTemplate,
  updateTallyTemplateDataSchema,
} from "@/lib/serverFunctions/mutations/modularTally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
  } catch {
    return new Response("Sem permissão para salvar protocolos de contagem!", {
      status: 401,
    });
  }

  try {
    const data = updateTallyTemplateDataSchema.parse(await request.json());
    const response = await updateTallyTemplate({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao salvar protocolo de contagem!", {
      status: 500,
    });
  }
}
