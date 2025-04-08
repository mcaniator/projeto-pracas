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
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks, // include session callback from auth.config.ts. Please check the file for more details.
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
      token.email = user.email;
      token.image = user.image;
      return token;
    },
  },
});
