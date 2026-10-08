import {
  deleteModularTally,
  deleteModularTallyDataSchema,
} from "@/lib/serverFunctions/mutations/modularTally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para excluir contagens!", {
      status: 401,
    });
  }

  try {
    const data = deleteModularTallyDataSchema.parse(await request.json());
    const response = await deleteModularTally({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao excluir contagem!", { status: 500 });
  }
}
