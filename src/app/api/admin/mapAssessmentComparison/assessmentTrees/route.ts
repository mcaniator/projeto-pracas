import { fetchMapAssessmentComparisonAssessmentTreesParamsSchema } from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { fetchMapAssessmentComparisonAssessmentTrees } from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

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
    const params = parseQueryParams(
      fetchMapAssessmentComparisonAssessmentTreesParamsSchema,
      searchParams,
    );
    const results = await fetchMapAssessmentComparisonAssessmentTrees({
      params,
    });

    return new Response(superjson.stringify(results), {
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
