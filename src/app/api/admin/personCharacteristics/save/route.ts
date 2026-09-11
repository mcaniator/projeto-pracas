import {
  savePersonCharacteristic,
  savePersonCharacteristicDataSchema,
} from "@/lib/serverFunctions/mutations/personCharacteristic";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
  } catch {
    return new Response("Sem permissão para salvar características!", {
      status: 401,
    });
  }

  try {
    const data = savePersonCharacteristicDataSchema.parse(await request.json());
    const response = await savePersonCharacteristic({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao salvar característica!", { status: 500 });
  }
}
