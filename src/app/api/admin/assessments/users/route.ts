import { fetchAssessmentUsers } from "@/lib/serverFunctions/queries/assessment";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["ASSESSMENT"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await fetchAssessmentUsers();
    return new Response(superjson.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Erro ao buscar avaliadores!", {
      status: 500,
    });
  }
}
