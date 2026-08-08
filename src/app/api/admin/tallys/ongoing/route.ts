import { fetchOngoingTallyParamsSchema } from "@/lib/serverFunctions/queries/tally";
import { fetchOngoingTallyById } from "@/lib/serverFunctions/queries/tally";
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
      fetchOngoingTallyParamsSchema,
      request.nextUrl.searchParams,
    );
    const result = await fetchOngoingTallyById(params.tallyId);

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Error fetching ongoing tally", { status: 500 });
  }
}
