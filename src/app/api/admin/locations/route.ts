import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

import { fetchLocations } from "../../../../lib/serverFunctions/queries/location";
import { parseQueryParams } from "../../../../lib/utils/apiCall";

const paramsSchema = z.object({
  cityId: z.coerce.number(),
});

export type FetchLocationsParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
    } catch (e) {
      return new Response("Sem permissão para consultar praças!", {
        status: 401,
      });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const locations = await fetchLocations(params);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro ao consultar praças!", { status: 500 });
  }
}
