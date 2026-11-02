import {
  createBehavioralMap,
  createBehavioralMapDataSchema,
} from "@/lib/serverFunctions/mutations/behavioralMapProtocol";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["TALLY_EDITOR", "TALLY_MANAGER"],
    });
  } catch {
    return new Response("Sem permissão para criar mapas comportamentais!", {
      status: 401,
    });
  }
  try {
    const data = createBehavioralMapDataSchema.parse(await request.json());
    const result = await createBehavioralMap({ data });
    return new Response(superjson.stringify(result), {
      status: result.responseInfo.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao criar mapa comportamental!", { status: 500 });
  }
}
