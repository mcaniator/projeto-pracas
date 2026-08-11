import { logout } from "@/lib/serverFunctions/mutations/login";
import superjson from "superjson";

export async function POST() {
  try {
    const result = await logout({});
    return new Response(superjson.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
