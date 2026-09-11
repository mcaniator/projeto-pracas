import {
  savePersonCharacteristicGroup,
  savePersonCharacteristicGroupDataSchema,
} from "@/lib/serverFunctions/mutations/personCharacteristic";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["TALLY_MANAGER"] });
  } catch {
    return new Response("Sem permissão para salvar grupos de características!", {
      status: 401,
    });
  }

  try {
    const data = savePersonCharacteristicGroupDataSchema.parse(
      await request.json(),
    );
    const response = await savePersonCharacteristicGroup({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Erro ao salvar grupo de características!", {
      status: 500,
    });
  }
}
