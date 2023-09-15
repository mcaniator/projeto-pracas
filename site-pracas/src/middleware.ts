import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const middleware = (request: NextRequest) => {
  if (request.nextUrl.pathname == "/admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/home";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export { middleware };
