import { PrismaAdapter } from "@auth/prisma-adapter";
import { getInviteToken } from "@serverOnly/invite";
import { userLoginSchema } from "@zodValidators";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";

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
            try {
              await prisma.$transaction(async (prisma) => {
                if (!user.email || !user.id) {
                  throw new Error(
                    `Error in signIn event: user ${!user.email ? "email " : ""} ${!user.id ? "id " : ""}is undefined.`,
                  );
                }

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
                    access_token: account.access_token,
                    scope: account.scope,
                    token_type: account.token_type,
                    id_token: account.id_token,
                    expires_at: account.expires_at,
                    provider: account.provider,
                    type: account.type,
                    providerAccountId: account.providerAccountId,
                  },
                });

                await prisma.invite.delete({
                  where: {
                    id: invite.id,
                  },
                });
              });
              return true;
            } catch (e) {
              return false;
            }
          }
        }
        if (!existingUser.active) {
          return false;
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
});
