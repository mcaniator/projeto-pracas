import { fetchCurrentUser } from "@/lib/serverFunctions/queries/user";

export async function GET() {
  const data = await fetchCurrentUser();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
