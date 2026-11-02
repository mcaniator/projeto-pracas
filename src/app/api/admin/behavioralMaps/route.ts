import {
  fetchBehavioralMaps,
  fetchBehavioralMapsParamsSchema,
} from "@/lib/serverFunctions/queries/behavioralMap";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para consultar mapas comportamentais!", {
      status: 401,
    });
  }
  try {
    const params = parseQueryParams(
      fetchBehavioralMapsParamsSchema,
      request.nextUrl.searchParams,
    );
    const result = await fetchBehavioralMaps({ params });
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=5",
      },
    });
  } catch {
    return new Response("Erro ao consultar mapas comportamentais!", {
      status: 500,
    });
  }
}
