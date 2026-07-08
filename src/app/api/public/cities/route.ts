import { publicFetchCitiesParamsSchema } from "@/lib/serverFunctions/apiCalls/public/cityParamsSchemas";
import { publicFetchCities } from "@/lib/serverFunctions/queries/public/city";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(publicFetchCitiesParamsSchema, searchParams);
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
