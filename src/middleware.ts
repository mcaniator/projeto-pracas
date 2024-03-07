import { verifyRequestOrigin } from "lucia";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const middleware = (request: NextRequest) => {
  if (request.nextUrl.pathname == "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/home";

    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname == "/admin/registration") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/registration/questions";

    return NextResponse.redirect(url);
  }

  if (request.method === "GET") {
    return NextResponse.next();
  }

  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return new NextResponse(null, {
      status: 403,
    });
  }

  return NextResponse.next();
};

export { middleware };
