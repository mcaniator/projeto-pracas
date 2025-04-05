import NextAuth from "next-auth";

import authConfig from "./lib/auth/auth.config";

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
  console.log(typeof req);
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }
  console.log("Middleware triggered", req.nextUrl.pathname);
  console.log("req", req.auth);
});

export const config = {
  matcher: ["/admin/:path*"],
};
