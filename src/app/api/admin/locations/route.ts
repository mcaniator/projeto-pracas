import "@/lib/utils/bigIntInJson";
import { fetchLocationsParamsSchema } from "@/lib/serverFunctions/apiCalls/locationParamsSchemas";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

import { fetchLocations } from "../../../../lib/serverFunctions/queries/location";
import { parseQueryParams } from "../../../../lib/utils/apiCall";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Sem permissão para consultar praças!", {
        status: 401,
      });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(fetchLocationsParamsSchema, searchParams);
    const locations = await fetchLocations(params);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return new Response("Erro ao consultar praças!", { status: 500 });
  }
}
