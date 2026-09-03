import { fetchFormParamsSchema } from "@/lib/serverFunctions/queries/form";
import { fetchForms } from "@/lib/serverFunctions/queries/form";
import { parseQueryParams } from "@/lib/utils/apiCall";
import "@/lib/utils/bigIntInJson";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
    } catch (e) {
      return new Response("Sem permissão para consultar formulários!", {
        status: 401,
      });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(fetchFormParamsSchema, searchParams);
    const forms = await fetchForms({ params });
    return new Response(superjson.stringify(forms), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response("Erro ao consultar formulários!", { status: 500 });
  }
}
