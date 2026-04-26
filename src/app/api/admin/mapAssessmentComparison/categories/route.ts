import { fetchMapAssessmentComparisonCategories } from "@/lib/serverFunctions/queries/mapAssessmentComparison";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Sem permissao para consultar categorias!", {
        status: 401,
      });
    }

    const categories = await fetchMapAssessmentComparisonCategories();

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=10",
      },
    });
  } catch (error) {
    return new Response("Erro ao consultar categorias!", { status: 500 });
  }
}
