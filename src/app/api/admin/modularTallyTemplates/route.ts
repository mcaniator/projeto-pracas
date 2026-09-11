import {
  fetchModularTallyTemplates,
  fetchModularTallyTemplatesParamsSchema,
} from "@/lib/serverFunctions/queries/modularTally";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para consultar protocolos de contagem!", {
      status: 401,
    });
  }

  try {
    const params = parseQueryParams(
      fetchModularTallyTemplatesParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchModularTallyTemplates({ params });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao consultar protocolos de contagem!", {
      status: 500,
    });
  }
}
