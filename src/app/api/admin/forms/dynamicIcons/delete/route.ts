import {
  deleteCustomDynamicIcon,
  deleteCustomDynamicIconDataSchema,
} from "@/lib/serverFunctions/mutations/questionIcon";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
  } catch (error) {
    return new Response("Sem permissão para excluir ícones personalizados!", {
      status: 401,
    });
  }

  try {
    const data = deleteCustomDynamicIconDataSchema.parse(await request.json());
    const response = await deleteCustomDynamicIcon({ data });

    return new Response(superjson.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Erro ao excluir ícone personalizado", {
      status: 500,
    });
  }
}
