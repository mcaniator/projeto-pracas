import { fetchCurrentUser } from "@/lib/serverFunctions/queries/user";
import superjson from "superjson";

export async function GET() {
  const data = await fetchCurrentUser({});
  return new Response(superjson.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
