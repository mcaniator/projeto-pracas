import { fetchCustomDynamicIcons } from "@/lib/serverFunctions/queries/customDynamicIcon";
import superjson from "superjson";

export async function GET() {
  const result = await fetchCustomDynamicIcons({});

  return new Response(superjson.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
