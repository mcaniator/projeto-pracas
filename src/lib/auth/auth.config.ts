import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "../prisma";
import { userLoginSchema } from "../zodValidators";

//We need to define session callback in auth.config.ts, and jwt callback in auth.ts. Check: https://github.com/nextauthjs/next-auth/issues/9836#issuecomment-2451288724
export default {
  session: { strategy: "database" },
  callbacks: {
    async session({ session }) {
      const dbUser = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          permissions: true,
          username: true,
          email: true,
          image: true,
        },
      });
      const ret = {
        ...session,
        user: {
          id: session.user.id,
          username: dbUser?.username ?? null,
          email: dbUser?.email ?? "",
          image: dbUser?.image ?? null,
          permissions:
            dbUser?.permissions.map((permission) => permission.feature) ?? [],
        },
      };
      return ret;
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
          include: {
            permissions: {
              select: {
                feature: true,
              },
            },
          },
        });

        if (!user || !user.password || !user.email) {
          return null;
        }
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) {
          const formattedUser = {
            ...user,
            permissions: user.permissions.map(
              (permission: { feature: string }) => permission.feature,
            ),
          };
          return formattedUser;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
