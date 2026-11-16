import type { NextResponse } from "next/server";

// Tokens live in httpOnly cookies so browser JS never sees them; /api/v1/* attaches them.
export const ACCESS_COOKIE = "ms_access";
export const REFRESH_COOKIE = "ms_refresh";
export const EMAIL_COOKIE = "ms_admin_email";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:9999";

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export interface TokenPayload {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export function setSessionCookies(
  res: NextResponse,
  tokens: TokenPayload,
  email?: string,
) {
  // Expire the cookie a minute early so the proxy refreshes before the backend says TOKEN_EXPIRED.
  res.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    ...base,
    maxAge: Math.max(tokens.expires_in - 60, 0),
  });
  if (tokens.refresh_token) {
    res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
      ...base,
      maxAge: REFRESH_MAX_AGE,
    });
  }
  if (email)
    res.cookies.set(EMAIL_COOKIE, email, { ...base, maxAge: REFRESH_MAX_AGE });
}

export function clearSessionCookies(res: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, EMAIL_COOKIE])
    res.cookies.delete(name);
}
