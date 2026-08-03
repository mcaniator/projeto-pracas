import { signOut } from "@auth/auth";

export async function POST() {
  try {
    await signOut({ redirect: false });

    return Response.json({
      responseInfo: { statusCode: 200 },
      data: null,
    });
  } catch {
    return Response.json(
      {
        responseInfo: { statusCode: 500, message: "Erro ao encerrar sessão." },
        data: null,
      },
      { status: 500 },
    );
  }
}
