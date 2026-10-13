import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../lib/auth/session";

// Server Components can't modify cookies, so the (app) layout sends a
// validly-signed session whose user no longer exists here. Without this,
// proxy.ts (signature-only check) and the layout (DB check) disagree and
// bounce /login <-> /dashboard forever.
export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
