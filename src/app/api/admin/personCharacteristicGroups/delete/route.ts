import {
  deletePersonCharacteristicGroup,
  deletePersonCharacteristicGroupDataSchema,
} from "@/lib/serverFunctions/mutations/personCharacteristic";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
  } catch {
    return new Response("Sem permissão para excluir grupos de características!", {
      status: 401,
    });
  }

  try {
    const data = deletePersonCharacteristicGroupDataSchema.parse(
      await request.json(),
    );
    const response = await deletePersonCharacteristicGroup({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao excluir grupo de características!", {
      status: 500,
    });
  }
}
