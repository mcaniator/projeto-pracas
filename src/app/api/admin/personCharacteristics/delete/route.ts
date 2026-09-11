import {
  deletePersonCharacteristic,
  deletePersonCharacteristicDataSchema,
} from "@/lib/serverFunctions/mutations/personCharacteristic";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
  } catch {
    return new Response("Sem permissão para excluir características!", {
      status: 401,
    });
  }

  try {
    const data = deletePersonCharacteristicDataSchema.parse(
      await request.json(),
    );
    const response = await deletePersonCharacteristic({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao excluir característica!", { status: 500 });
  }
}
