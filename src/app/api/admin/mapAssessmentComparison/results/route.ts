import { fetchMapAssessmentComparisonResults } from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  cityId: z.coerce.number(),
  categoryId: z.coerce.number(),
});

export type FetchMapAssessmentComparisonResultsParams = z.infer<
  typeof paramsSchema
>;

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Sem permissao para consultar avaliacoes!", {
        status: 401,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(paramsSchema, searchParams);
    const results = await fetchMapAssessmentComparisonResults(params);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=10",
      },
    });
  } catch (error) {
    return new Response("Erro ao consultar avaliacoes!", { status: 500 });
  }
}
