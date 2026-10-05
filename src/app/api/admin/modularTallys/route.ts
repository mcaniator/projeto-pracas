import {
  fetchModularTallys,
  fetchModularTallysParamsSchema,
} from "@/lib/serverFunctions/queries/modularTally";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para consultar contagens!", {
      status: 401,
    });
  }

  try {
    const params = parseQueryParams(
      fetchModularTallysParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchModularTallys({ params });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=5",
      },
    });
  } catch {
    return new Response("Erro ao consultar contagens!", { status: 500 });
  }
}
