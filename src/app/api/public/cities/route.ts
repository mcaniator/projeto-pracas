import { publicFetchCities } from "@/lib/serverFunctions/queries/public/city";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { BrazilianStates } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  state: z.nativeEnum(BrazilianStates),
  includeAdminstrativeRegions: z.coerce.boolean().optional(),
});

export type PublicFetchCitiesParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const locations = await publicFetchCities(params);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Erro ao buscar cidades!", {
      status: 500,
    });
  }
}
