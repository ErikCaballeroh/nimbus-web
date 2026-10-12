import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./lib/auth/session";

const protectedPrefixes = ["/dashboard", "/projects", "/team", "/notifications", "/settings"];
const authPaths = ["/login", "/register", "/recover", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = authPaths.includes(pathname);

  if (!isProtected && !isAuthPage) return NextResponse.next();

  // Optimistic check only: verifies the cookie's signature, no DB round trip.
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (isProtected && !userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*$).*)"],
};
