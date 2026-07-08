import { fetchOngoingTallyParamsSchema } from "@/lib/serverFunctions/apiCalls/tallyParamsSchemas";
import { fetchOngoingTallyById } from "@/lib/serverFunctions/queries/tally";
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
    fetchOngoingTallyParamsSchema,
    request.nextUrl.searchParams,
  );
  const result = await fetchOngoingTallyById(params.tallyId);

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
