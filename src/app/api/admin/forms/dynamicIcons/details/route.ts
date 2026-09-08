import {
  fetchCustomDynamicIconDetails,
  fetchCustomDynamicIconDetailsParamsSchema,
} from "@/lib/serverFunctions/queries/questionIcon";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const params = parseQueryParams(
      fetchCustomDynamicIconDetailsParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchCustomDynamicIconDetails({ params });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=5",
      },
    });
  } catch (error) {
    return new Response("Erro ao consultar ícone personalizado", {
      status: 500,
    });
  }
}
