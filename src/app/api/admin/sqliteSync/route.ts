import { sqliteSyncParamsSchema } from "@/lib/serverFunctions/queries/sqliteSync";
import { fetchSQLiteSyncData } from "@/lib/serverFunctions/queries/sqliteSync";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["PARK"] });
    } catch (e) {
      return new Response("Unauthorized", { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const params = parseQueryParams(sqliteSyncParamsSchema, searchParams);
    const users = await fetchSQLiteSyncData({ params });
    return new Response(superjson.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro ao buscar dados!", { status: 500 });
  }
}
