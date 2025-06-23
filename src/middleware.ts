import NextAuth from "next-auth";

import authConfig from "./lib/auth/auth.config";

const { auth } = NextAuth(authConfig);
export default auth((req) => {
  if (!req.auth) {
    return Response.redirect(new URL("/auth/login", req.url));
  }
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;

  if (pathname === "/admin") {
    const url = new URL("/admin/home", req.url);
    url.search = search;
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
