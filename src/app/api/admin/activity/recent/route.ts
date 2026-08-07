import { fetchRecentActivity } from "@/lib/serverFunctions/queries/activity";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({
        roleGroups: ["ASSESSMENT", "TALLY"],
      });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await fetchRecentActivity();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Erro obter atividade recente", { status: 500 });
  }
}
