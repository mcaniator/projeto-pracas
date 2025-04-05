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
    signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }
      if (!user.id) {
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
      token.permissions = user.permissions;
      return token;
    },
    session({ token, session }) {
      const ret = {
        ...session,
        user: {
          id: token.sub,
          username: token.username as string | null,
          isOauth: token.isOauth as string | null,
          permissions: token.permissions as string[],
        },
      };
      return ret;
    },
  },
});
