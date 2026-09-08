import { fetchDynamicIconsParamsSchema } from "@/lib/serverFunctions/queries/questionIcon";
import { fetchDynamicIcons } from "@/lib/serverFunctions/queries/questionIcon";
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
  const searchParams = request.nextUrl.searchParams;
  const param = parseQueryParams(fetchDynamicIconsParamsSchema, searchParams);
  const parse = fetchDynamicIconsParamsSchema.safeParse(param);

  const response = await fetchDynamicIcons({ params: parse.data });

  return new Response(superjson.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=5",
    },
  });
}
