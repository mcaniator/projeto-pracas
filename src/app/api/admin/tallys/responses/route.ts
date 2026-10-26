import {
  tallySubmit,
  tallySubmitDataSchema,
} from "@/lib/serverFunctions/mutations/tally";
import { checkIfLoggedInUserHasAnyPermission } from "@serverOnly/checkPermission";
import superjson from "superjson";

export async function POST(request: Request) {
  try {
    await checkIfLoggedInUserHasAnyPermission({ roleGroups: ["TALLY"] });
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = tallySubmitDataSchema.parse(await request.json());
    const result = await tallySubmit({ data });

    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response("Internal Server Error", { status: 500 });
  }
}
