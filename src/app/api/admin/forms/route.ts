import { fetchForms } from "@/lib/serverFunctions/queries/form";
import { parseQueryParams } from "@/lib/utils/apiCall";
import "@/lib/utils/bigIntInJson";
import { booleanFromString } from "@/lib/zodValidators";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import { z } from "zod";

const paramsSchema = z.object({
  finalizedOnly: booleanFromString.nullish(),
  includeArchived: booleanFromString.nullish(),
});

export type FetchFormParams = z.infer<typeof paramsSchema>;

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
    const params = parseQueryParams(paramsSchema, searchParams);
    const forms = await fetchForms(params);
    return new Response(JSON.stringify(forms), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro ao consultar formulários!", { status: 500 });
  }
}
