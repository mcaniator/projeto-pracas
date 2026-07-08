import { prisma } from "@/lib/prisma";
import { signIn, signOut, auth } from "@auth/auth";
import { userLoginSchema } from "@zodValidators";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const session = await auth();
    if (session) {
      await signOut({ redirect: false });
    }

    const loginUser = userLoginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const userExists = await prisma.user.findUnique({
      where: {
        email: loginUser.email,
        active: true,
      },
    });

    if (!userExists || !userExists.password || !userExists.email) {
      return Response.json({
        responseInfo: { statusCode: 404 },
        data: null,
      });
    }

    const passwordsMatch = await bcrypt.compare(
      loginUser.password,
      userExists.password,
    );
    if (!passwordsMatch) {
      return Response.json({
        responseInfo: { statusCode: 401 },
        data: null,
      });
    }

    await signIn("credentials", {
      email: loginUser.email,
      password: loginUser.password,
      redirect: false,
    });

    return Response.json({
      responseInfo: { statusCode: 200 },
      data: null,
    });
  } catch (e) {
    const statusCode = e instanceof AuthError ? 401 : 500;
    return Response.json({
      responseInfo: { statusCode },
      data: null,
    });
  }
}
