import { BrazilianStates } from "@prisma/client";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fetchCities } from "../../../../lib/serverFunctions/queries/city";
import { parseQueryParams } from "../../../../lib/utils/apiCall";

const paramsSchema = z.object({
  state: z.nativeEnum(BrazilianStates),
  includeAdminstrativeRegions: z.coerce.boolean().optional(),
});

export type FetchCitiesParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const locations = await fetchCities(params);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro ao buscar cidades!", {
      status: 500,
    });
  }
}
