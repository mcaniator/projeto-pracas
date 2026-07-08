import { auth } from "@/lib/auth/auth";
import { getUserAuthInfo } from "@/lib/serverFunctions/queries/user";

export async function GET() {
  const session = await auth();
  const user = await getUserAuthInfo(session?.user?.id);

  if (!user) {
    return new Response(
      JSON.stringify({
        responseInfo: {
          statusCode: 401,
          message: "Usuario nao autenticado.",
        },
        data: {
          user: null,
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      responseInfo: { statusCode: 200 },
      data: { user },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
