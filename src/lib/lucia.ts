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
    assessmentId: attributes.assessmentId,
  }),
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});

const validateRequest = unstable_cache(
  async () => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

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

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: User;
  }
}

export { lucia, validateRequest };
