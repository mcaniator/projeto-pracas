import { fetchFinalizedTallysDataVisualizationParamsSchema } from "@/lib/serverFunctions/queries/tally";
import { fetchFinalizedTallysToDataVisualization } from "@/lib/serverFunctions/queries/tally";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const params = parseQueryParams(
      fetchFinalizedTallysDataVisualizationParamsSchema,
      request.nextUrl.searchParams,
    );
    const result = await fetchFinalizedTallysToDataVisualization({ params });

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Erro ao buscar contagem!", { status: 500 });
  }
}
