"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";

import { signIn } from "../lib/auth/auth";

const googleAuthenticate = async () => {
  try {
    await signIn("google", { redirectTo: "/admin/home" });
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
  try {
    if (!inviteToken) {
      throw new Error("Invite token is required");
    }
    const cookieStore = await cookies();
    cookieStore.set("inviteToken", inviteToken, {
      path: "/",
      maxAge: 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    await signIn("google", { redirectTo: "/admin/home" });
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
