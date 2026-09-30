import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, safeNextPath } from "@/lib/auth";
import { verifySession } from "@/lib/session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/visual-scraper",
  "/live",
  "/data",
  "/enrich",
  "/workflows",
  "/healing",
  "/connectors",
  "/api/",
];

function isProtected(pathname: string) {
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/leads")) return false;
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  const authed = Boolean(session);

  if ((pathname === "/login" || pathname === "/signup") && authed) {
    const next = safeNextPath(searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (isProtected(pathname) && !authed) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Sign in required" }, { status: 401 })
      : NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/pricing",
    "/dashboard",
    "/dashboard/:path*",
    "/visual-scraper/:path*",
    "/live/:path*",
    "/data/:path*",
    "/enrich/:path*",
    "/workflows/:path*",
    "/healing/:path*",
    "/connectors/:path*",
    "/api/:path*",
  ],
};
