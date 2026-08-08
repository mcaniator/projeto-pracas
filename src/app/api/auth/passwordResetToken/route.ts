import {
  fetchPasswordResetToken,
  fetchPasswordResetTokenParamsSchema,
} from "@queries/passwordReset";
import { NextRequest } from "next/server";
import superjson from "superjson";

export async function GET(request: NextRequest) {
  const parse = fetchPasswordResetTokenParamsSchema.safeParse({
    token: request.nextUrl.searchParams.get("token"),
  });

  if (!parse.success) {
    return new Response("Invalid params", { status: 400 });
  }

  const result = await fetchPasswordResetToken(parse.data);

  return new Response(superjson.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
