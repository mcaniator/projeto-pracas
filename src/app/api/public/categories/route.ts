import { publicFetchCategories } from "@/lib/serverFunctions/queries/public/category";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  cityId: z.coerce.number(),
});

export type PublicFetchCategoriesParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const locations = await publicFetchCategories(params);
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
