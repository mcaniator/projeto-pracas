"use server";

import { auth, signIn, signOut } from "@lib/auth/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";

const googleAuthenticate = async () => {
  if (process.env.ENABLE_GOOGLE_LOGIN !== "true") {
    return { statusCode: 503, message: "Serviço indisponível!" };
  }
  try {
    const session = await auth();
    if (session) {
      await signOut({ redirect: false });
    }
    await signIn("google", { redirect: true, redirectTo: "/admin/home" });
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }
    if (e instanceof AuthError) {
      return { statusCode: 400, message: "Error ao fazer login com Google!" };
    }
  }
};

const googleRegister = async (inviteToken: string) => {
  if (process.env.ENABLE_GOOGLE_LOGIN !== "true") {
    return { statusCode: 503, message: "Serviço indisponível!" };
  }
  try {
    if (!inviteToken) {
      throw new Error("Invite token is required");
    }
    const session = await auth();
    if (session) {
      await signOut({ redirect: false });
    }
    const cookieStore = await cookies();
    cookieStore.set("inviteToken", inviteToken, {
      path: "/",
      maxAge: 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    await signIn("google", { redirect: true, redirectTo: "/admin/home" });
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }
    if (e instanceof AuthError) {
      return { statusCode: 400, message: "Error ao registrar com Google!" };
    }
  }
};

export { googleAuthenticate, googleRegister };
