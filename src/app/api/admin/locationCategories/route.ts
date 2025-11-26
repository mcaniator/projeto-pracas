import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";

import { fetchLocationCategories } from "../../../../lib/serverFunctions/queries/locationCategory";

export async function GET() {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const locations = await fetchLocationCategories();
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro cao buscar categorias de praças!", {
      status: 500,
    });
  }
}
