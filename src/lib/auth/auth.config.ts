import type { NextAuthConfig } from "next-auth";

//We need to define session callback in auth.config.ts, and jwt callback in auth.ts. Check: https://github.com/nextauthjs/next-auth/issues/9836#issuecomment-2451288724
export default {
  session: { strategy: "jwt", maxAge: 2592000 * 6 },
  trustHost: true,
  pages: {
    error: "/auth/error",
    signIn: "/auth/login",
    signOut: "/auth/logout",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NEXT_PUBLIC_DEBUG === "true" ?
          "authjs.session-token"
        : "__Secure-authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: process.env.NEXT_PUBLIC_DEBUG === "true" ? "lax" : "none",
        secure: process.env.NEXT_PUBLIC_DEBUG === "true" ? false : true,
        path: "/",
      },
    },
    callbackUrl: {
      name:
        process.env.NEXT_PUBLIC_DEBUG === "true" ?
          "authjs.callback-url"
        : "__Secure-authjs.callback-url",
      options: {
        httpOnly: true,
        sameSite: process.env.NEXT_PUBLIC_DEBUG === "true" ? "lax" : "none",
        secure: process.env.NEXT_PUBLIC_DEBUG === "true" ? false : true,
        path: "/",
      },
    },
  },
  callbacks: {
    session({ token, session }) {
      return {
        ...session,
        user: {
          id: token.sub,
          username: token.username as string | null,
          email: token.email as string,
          image: token.image as string | null,
        },
      };
    },
  },
  providers: [],
} satisfies NextAuthConfig;
