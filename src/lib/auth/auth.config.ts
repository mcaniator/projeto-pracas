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
