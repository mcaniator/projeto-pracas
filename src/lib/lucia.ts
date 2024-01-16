import { prisma as client } from "@/lib/prisma";
import { prisma } from "@lucia-auth/adapter-prisma";
import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";

const auth = lucia({
  adapter: prisma(client, {
    user: "user",
    key: "key",
    session: "session",
  }),
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),

  sessionCookie: {
    expires: false,
  },

  getUserAttributes: (data) => {
    return {
      username: data.username,
      type: data.type,
    };
  },
});
type Auth = typeof auth;

export { auth };
export type { Auth };
