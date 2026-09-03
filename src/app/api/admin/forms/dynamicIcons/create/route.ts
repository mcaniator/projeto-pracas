import {
  createDynamicIcon,
  createDynamicIconDataSchema,
} from "@/lib/serverFunctions/mutations/questionIcon";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    try {
      await checkIfLoggedInUserHasAnyPermission({ roles: ["FORM_MANAGER"] });
    } catch (error) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = createDynamicIconDataSchema.parse(await request.json());
    const result = await createDynamicIcon({ data });

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
