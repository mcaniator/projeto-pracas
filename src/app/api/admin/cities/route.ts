import { fetchCitiesParamsSchema } from "@/lib/serverFunctions/apiCalls/cityParamsSchemas";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

import { fetchCities } from "../../../../lib/serverFunctions/queries/city";
import { parseQueryParams } from "../../../../lib/utils/apiCall";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(fetchCitiesParamsSchema, searchParams);
    const locations = await fetchCities(params);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    return new Response("Erro ao buscar cidades!", {
      status: 500,
    });
  }
}
