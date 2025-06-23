import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "../prisma";
import { userLoginSchema } from "../zodValidators";

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
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validateData = userLoginSchema.safeParse(credentials);
        if (!validateData || !validateData.data) return null;
        const { email, password } = validateData.data;
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
            email: true,
            username: true,
            password: true,
            image: true,
          },
        });

        if (!user || !user.password || !user.email) {
          return null;
        }
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
          return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
