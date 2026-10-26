import {
  fetchTallys,
  fetchTallysParamsSchema,
} from "@/lib/serverFunctions/queries/tally";
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
      fetchTallysParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchTallys({ params });

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
