import {
  fetchBehavioralMapDetails,
  fetchBehavioralMapDetailsParamsSchema,
} from "@/lib/serverFunctions/queries/behavioralMap";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para consultar o mapa comportamental!", {
      status: 401,
    });
  }
  try {
    const params = parseQueryParams(
      fetchBehavioralMapDetailsParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchBehavioralMapDetails({ params });
    return new Response(superjson.stringify(response), {
      status: response.responseInfo.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=5",
      },
    });
  } catch {
    return new Response("Erro ao consultar o mapa comportamental!", {
      status: 500,
    });
  }
}
