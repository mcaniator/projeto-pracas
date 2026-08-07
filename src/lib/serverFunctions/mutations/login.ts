import { prisma } from "@/lib/prisma";
import { auth, signIn, signOut } from "@auth/auth";
import { userLoginSchema } from "@zodValidators";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

const _login = async (
  formData: FormData,
): Promise<{ statusCode: number } | null> => {
  try {
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
      return { statusCode: 404 };
    }

    const passwordsMatch = await bcrypt.compare(
      loginUser.password,
      userExists.password,
    );
    if (!passwordsMatch) {
      return { statusCode: 401 };
    }

    await signIn("credentials", {
      email: loginUser.email,
      password: loginUser.password,
      redirect: false,
    });
    return { statusCode: 200 };
  } catch (e) {
    if (e instanceof AuthError) {
      switch (e.type) {
        case "CredentialsSignin":
          return { statusCode: 401 };
        default:
          return { statusCode: 401 };
      }
    }
    return { statusCode: 500 };
  }
};

export type LoginResponse = Awaited<ReturnType<typeof login>>["data"];
export const login = async (formData: FormData) => {
  const result = await _login(formData);
  return {
    responseInfo: { statusCode: result?.statusCode ?? 500 },
    data: null,
  };
};

export type LogoutResponse = Awaited<ReturnType<typeof logout>>["data"];
export const logout = async () => {
  try {
    await signOut({ redirect: false });
    return { responseInfo: { statusCode: 200 }, data: null };
  } catch {
    return {
      responseInfo: { statusCode: 500, message: "Erro ao encerrar sessão." },
      data: null,
    };
  }
};
