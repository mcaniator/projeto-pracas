import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "../prisma";
import { userLoginSchema } from "../zodValidators";

export default {
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
