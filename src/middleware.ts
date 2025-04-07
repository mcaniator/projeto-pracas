import NextAuth from "next-auth";

import authConfig from "./lib/auth/auth.config";

const { auth } = NextAuth(authConfig);
export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }
  const pathname = req.nextUrl.pathname;
  if (pathname === "/admin") {
    return Response.redirect(new URL("/admin/home", req.url));
  }
  if (!req.auth.user.username && pathname !== "/admin/user/usernameWarning") {
    return Response.redirect(new URL("/admin/user/usernameWarning", req.url));
  }
  if (pathname === "/admin/user/usernameWarning" && req.auth.user.username) {
    return Response.redirect(new URL("/admin/home", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
