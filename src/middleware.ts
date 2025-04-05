import NextAuth from "next-auth";

import authConfig from "./lib/auth/auth.config";

const { auth } = NextAuth(authConfig);
export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
