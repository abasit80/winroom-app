export const SESSION_COOKIE = "winroom_session";
export const SESSION_DAYS = 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export function safeNextPath(value: string | null | undefined) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/login") ||
    value.startsWith("/signup")
  ) {
    return "/dashboard";
  }
  return value;
}

export function sessionCookieOptions(maxAge = SESSION_DAYS * 24 * 60 * 60) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function authSecret() {
  return process.env.AUTH_SECRET || "winroom-dev-auth-secret-change-me";
}
