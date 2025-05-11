import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { cookies } from "next/headers";

import { getInviteToken } from "../../serverActions/inviteUtil";
import { updateUserRoleAfterUserCreation } from "../../serverOnly/user";
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
        });

        if (!existingUser) {
          const cookieStore = await cookies();
          const inviteToken = cookieStore.get("inviteToken")?.value;
          cookieStore.delete("inviteToken");

          if (!inviteToken || !user.email || !user.id || !account) {
            return false;
          }
          const invite = await getInviteToken(inviteToken, user.email);

          if (!invite) {
            return false;
          } else {
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                roles: invite.roles,
              },
            });

            await prisma.account.create({
              data: {
                userId: user.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                id_token: account.id_token,
                expires_at: account.expires_at,
                scope: account.scope,
                token_type: account.token_type,
              },
            });
            return true;
          }
        }

        return true;
      }
      if (!user.id) {
        return false;
      }
      return true;
    },
    jwt({ token, user }) {
      if (!token.sub) {
        return token;
      }

      if (!user) return token;
      token.username = user.username;
      token.email = user.email;
      token.image = user.image;
      return token;
    },
  },
  /*events: {
    async createUser(message) {
      // This event is triggered when a user is created. We can use this to assign roles to the user.
      // None of the errors present here should happen, but those checks are required because of the User type from auth.js
      const user = message.user;
      if (!user.email || !user.id) {
        throw new Error(
          `Error in createUser event: user.${!user.email ? "user.email" : "user.id"} is undefined. user created without roles.`,
        );
      }
      const cookieStore = await cookies();
      const inviteToken = cookieStore.get("inviteToken")?.value;
      if (!inviteToken) {
        throw new Error(
          `WARNING: invite token not found in createUser event. User created without roles.`,
        );
      }
      const invite = await getInviteToken(inviteToken, user.email);
      if (!invite) {
        throw new Error(
          `WARNING: invite token not found in createUser event. User created without roles.`,
        );
      }
      await updateUserRoleAfterUserCreation(user.id, invite.roles);
      cookieStore.delete("inviteToken");
    },
  },*/
});
