import { fetchPasswordResetTokenParamsSchema } from "@/lib/serverFunctions/apiCalls/passwordResetParamsSchemas";
import { getResetPasswordUserByToken } from "@queries/passwordReset";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const parse = fetchPasswordResetTokenParamsSchema.safeParse({
    token: request.nextUrl.searchParams.get("token"),
  });

  if (!parse.success) {
    return new Response("Invalid params", { status: 400 });
  }

  const tokenResponse = await getResetPasswordUserByToken(parse.data.token);

  if (!tokenResponse) {
    return new Response(
      JSON.stringify({
        responseInfo: {
          statusCode: 404,
          message: "Token invalido.",
        },
        data: {
          email: null,
        },
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      responseInfo: { statusCode: 200 },
      data: {
        email: tokenResponse.user.email,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
