import {
  fetchPersonCharacteristicGroups,
  fetchPersonCharacteristicGroupsParamsSchema,
} from "@/lib/serverFunctions/queries/personCharacteristic";
import { parseQueryParams } from "@/lib/utils/apiCall";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para consultar características!", {
      status: 401,
    });
  }

  try {
    const params = parseQueryParams(
      fetchPersonCharacteristicGroupsParamsSchema,
      request.nextUrl.searchParams,
    );
    const response = await fetchPersonCharacteristicGroups({ params });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao consultar características!", { status: 500 });
  }
}
