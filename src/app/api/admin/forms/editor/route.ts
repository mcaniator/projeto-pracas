import {
  fetchFormStructure,
  fetchFormStructureParamsSchema,
} from "@/lib/serverFunctions/queries/form";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["FORM"] });
  } catch (e) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = parseQueryParams(
    fetchFormStructureParamsSchema,
    request.nextUrl.searchParams,
  );
  const result = await fetchFormStructure(params);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
