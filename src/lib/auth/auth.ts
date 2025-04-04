import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import { getAccountByUserId, getUserById } from "../../serverActions/userUtil";
import { prisma } from "../prisma";
import authConfig from "./auth.config";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }
      if (!user.id) {
        return false;
      }
      const existingUser = await getUserById(user.id);
      if (!existingUser?.emailVerified) {
        return false;
      }
      return true;
    },
    async jwt({ token }) {
      if (!token.sub) {
        return token;
      }
      const user = await getUserById(token.sub);
      if (!user) return token;
      const existingAccount = await getAccountByUserId(user.id);
      token.username = user.username;
      token.isOauth = !!existingAccount;
      token.permissions = user.permission;
      return token;
    },
    session({ token, session }) {
      return {
        ...session,
        user: {
          id: token.sub,
          username: token.username,
          isOauth: token.isOauth,
          permissions: token.permissions,
        },
      };
    },
  },
});
