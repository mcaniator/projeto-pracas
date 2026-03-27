import { publicFetchLocations } from "@/lib/serverFunctions/queries/public/location";
import "@/lib/utils/bigIntInJson";
import { parseQueryParams } from "@lib/utils/apiCall";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  cityId: z.coerce.number().nullish(),
  locationId: z.coerce.number().nullish(),
});

export type PublicFetchLocationsParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
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
