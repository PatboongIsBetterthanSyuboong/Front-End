import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const url = request.nextUrl;

  if (url.pathname === "/") {
    const target = token ? "/dashboard" : "/login";
    if (url.pathname !== target) {
      return NextResponse.redirect(new URL(target, url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};


