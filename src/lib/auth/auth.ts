import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

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
  },
});
