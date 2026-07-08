import { fetchDynamicIconsParamsSchema } from "@/lib/serverFunctions/apiCalls/questionIconParamsSchemas";
import { fetchDynamicIcons } from "@/lib/serverFunctions/queries/questionIcon";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }

  const parse = fetchDynamicIconsParamsSchema.safeParse({
    query: request.nextUrl.searchParams.get("query"),
    limit: request.nextUrl.searchParams.get("limit"),
  });

  if (!parse.success) {
    return new Response("Invalid params", { status: 400 });
  }

  const response = fetchDynamicIcons(parse.data);

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
