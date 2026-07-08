import { fetchFinalizedTallysDataVisualizationParamsSchema } from "@/lib/serverFunctions/apiCalls/tallyParamsSchemas";
import { fetchFinalizedTallysToDataVisualization } from "@/lib/serverFunctions/queries/tally";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = parseQueryParams(
    fetchFinalizedTallysDataVisualizationParamsSchema,
    request.nextUrl.searchParams,
  );
  const result = await fetchFinalizedTallysToDataVisualization(params.tallyIds);

  return new Response(
    JSON.stringify({
      responseInfo: {
        statusCode: result.statusCode,
      },
      data: result,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
