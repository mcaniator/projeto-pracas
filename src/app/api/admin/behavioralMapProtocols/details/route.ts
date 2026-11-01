import {
  fetchBehavioralMapProtocolStructure,
  fetchBehavioralMapProtocolStructureParamsSchema,
} from "@/lib/serverFunctions/queries/behavioralMapProtocolStructure";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response(
      "Sem permissão para consultar protocolo de mapa comportamental!",
      {
        status: 401,
      },
    );
  }

  try {
    const params = parseQueryParams(
      fetchBehavioralMapProtocolStructureParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchBehavioralMapProtocolStructure({ params });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao consultar protocolo de mapa comportamental!", {
      status: 500,
    });
  }
}
