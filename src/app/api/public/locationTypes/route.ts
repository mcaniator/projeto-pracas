import { publicFetchLocationTypes } from "@/lib/serverFunctions/queries/public/locationType";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  cityId: z.coerce.number(),
});

export type PublicFetchLocationTypesParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const locations = await publicFetchLocationTypes(params);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Erro ao buscar tipos de pracas!", {
      status: 500,
    });
  }
}
