import { publicFetchTallyDetails } from "@/lib/serverFunctions/queries/public/tally";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  tallyId: z.coerce.number().optional(),
});

export type PublicFetchTallyDetailsParams = z.infer<typeof paramsSchema>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const tallyDetails = await publicFetchTallyDetails(params);
    return new Response(JSON.stringify(tallyDetails), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return new Response("Erro ao consultar detalhes da contagem!", {
      status: 500,
    });
  }
}
