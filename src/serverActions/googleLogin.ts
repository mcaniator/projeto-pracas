"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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

export default googleAuthenticate;
