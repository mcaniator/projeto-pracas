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

  return NextResponse.next();
};

export { middleware };
