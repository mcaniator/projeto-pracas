import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import authConfig from "./lib/auth/auth.config";

const defaultAllowedOrigins = [
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "https://localhost",
  process.env.BASE_URL,
  process.env.NEXT_PUBLIC_BASE_URL,
].filter(Boolean) as string[];

const allowedOrigins = new Set([
  ...defaultAllowedOrigins.map((origin) => origin.replace(/\/$/, "")),
]);

const isAllowedOrigin = (origin: string | null) => {
  if (!origin) {
    return false;
  }

  const normalizedOrigin = origin.replace(/\/$/, "");
  return allowedOrigins.has(normalizedOrigin);
};

const setCorsHeaders = (request: NextRequest, response: NextResponse) => {
  const origin = request.headers.get("origin");

  if (isAllowedOrigin(origin)) {
    // Allow the requesting origin to access the resource
    response.headers.set("Access-Control-Allow-Origin", origin as string);
    // Allow cookies and auth credentials in cross-origin requests
    response.headers.set("Access-Control-Allow-Credentials", "true");
    // Ensure caches vary the response by origin
    response.headers.set("Vary", "Origin");
  }

  // Define which HTTP methods are allowed for CORS requests
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );
  // Define which headers are allowed in the request
  response.headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("access-control-request-headers") ??
      "Content-Type, Authorization, X-CSRF-Token, X-Requested-With",
  );
  // Cache the preflight response for one day
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
};

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/") {
    // Redirect to public map
    const url = new URL("/map", request.url);
    return Response.redirect(url);
  }
  if (pathname.startsWith("/admin")) {
    // Auth required for all /admin routes
    const session = await auth();
    if (!session) {
      return Response.redirect(new URL("/auth/login", request.url));
    }

    if (pathname === "/admin") {
      // Redirect to admin map
      const url = new URL("/admin/map", request.url);
      return Response.redirect(url);
    }
  }
  if (request.method === "OPTIONS") {
    return setCorsHeaders(request, new NextResponse(null, { status: 204 }));
  }

  return setCorsHeaders(request, NextResponse.next());
}

export const config = {
  matcher: ["/", "/api/:path*", "/admin/:path*"],
};
