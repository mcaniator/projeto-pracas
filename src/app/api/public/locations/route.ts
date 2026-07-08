import { publicFetchLocationsParamsSchema } from "@/lib/serverFunctions/apiCalls/public/locationParamsSchemas";
import { publicFetchLocations } from "@/lib/serverFunctions/queries/public/location";
import "@/lib/utils/bigIntInJson";
import { parseQueryParams } from "@lib/utils/apiCall";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(publicFetchLocationsParamsSchema, searchParams);
    const locations = await publicFetchLocations(params);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Erro ao consultar praças!", { status: 500 });
  }
}
