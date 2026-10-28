import {
  createTally,
  createTallyDataSchema,
} from "@/lib/serverFunctions/mutations/tally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({
      roles: ["TALLY_EDITOR", "TALLY_MANAGER"],
    });
  } catch {
    return new Response("Sem permissão para criar contagens!", {
      status: 401,
    });
  }

  try {
    const data = createTallyDataSchema.parse(await request.json());
    const response = await createTally({ data });

    return new Response(superjson.stringify(response), {
      status: response.responseInfo.statusCode,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao criar contagem!", { status: 500 });
  }
}
