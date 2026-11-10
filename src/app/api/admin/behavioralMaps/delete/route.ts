import {
  deleteBehavioralMap,
  deleteBehavioralMapDataSchema,
} from "@/lib/serverFunctions/mutations/behavioralMapSubmission";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Sem permissão para excluir mapas comportamentais!", {
      status: 401,
    });
  }

  try {
    const data = deleteBehavioralMapDataSchema.parse(await request.json());
    const response = await deleteBehavioralMap({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao excluir mapa comportamental!", { status: 500 });
  }
}
