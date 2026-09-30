import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { signSession } from "@/lib/session";
import { authenticateUser, publicUser } from "@/lib/users";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = body.email?.trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await authenticateUser(email, password);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const user = publicUser(result.user);
  const token = await signSession(user);
  const response = NextResponse.json({ ok: true, user });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}
