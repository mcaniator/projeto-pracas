import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { User } from "@prisma/client";
import { Lucia } from "lucia";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";

const prismaAdapter = new PrismaAdapter(prisma.session, prisma.user);
const lucia = new Lucia(prismaAdapter, {
  getUserAttributes: (attributes) => ({
    id: attributes.id,
    email: attributes.email,
    username: attributes.username,
    type: attributes.type,
  }),
  sessionCookie: {
    expires: false,
    attributes: {
      // this causes issues when running a production build on localhost because cookie info won't be sent with https
      secure: process.env.NODE_ENV === "production",
    },
  },
});

const validateRequest = async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const validateFunction = unstable_cache(
    async (sessionId: string) => {
      const result = await lucia.validateSession(sessionId);

      try {
        if (result.session && result.session.fresh) {
          const sessionCookie = lucia.createSessionCookie(result.session.id);
          cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
          );
        }

        if (!result.session) {
          const sessionCookie = lucia.createBlankSessionCookie();
          cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
          );
        }
      } catch {
        /* empty */
      }

      return result;
    },
    ["requestValidation"],
    { tags: ["user", "session", "database"] },
  );
  return await validateFunction(sessionId);
};

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: User;
  }
}

export { lucia, validateRequest };
