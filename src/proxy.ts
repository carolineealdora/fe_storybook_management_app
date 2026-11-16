import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  clearSessionCookies,
  setSessionCookies,
  type TokenPayload,
} from "@/lib/session";

const SESSION_ENDED = {
  error: {
    code: "UNAUTHORIZED",
    message: "Your session has ended. Please sign in again.",
  },
};

function signedOut(req: NextRequest) {
  const res = req.nextUrl.pathname.startsWith("/api/")
    ? NextResponse.json(SESSION_ENDED, { status: 401 })
    : NextResponse.redirect(new URL("/login", req.url));
  clearSessionCookies(res);
  return res;
}

async function refresh(refreshToken: string): Promise<TokenPayload | null> {
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).catch(() => null);
  if (!res?.ok) return null;
  return ((await res.json()) as { data: TokenPayload }).data;
}

// ponytail: optimistic cookie check only; the backend still validates every token and role.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/v1/admin/auth/");
  if (isAuthApi) return NextResponse.next();

  let access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  // Access token expired but refresh token alive: refresh silently (E20).
  let refreshed: TokenPayload | null = null;
  if (!access && refreshToken) {
    refreshed = await refresh(refreshToken);
    if (!refreshed) return signedOut(req); // E21
    access = refreshed.access_token;
    req.cookies.set(ACCESS_COOKIE, access); // so this same request sees the new token
  }

  let res: NextResponse;
  if (!access) {
    res = isLogin ? NextResponse.next() : signedOut(req);
  } else if (isLogin) {
    res = NextResponse.redirect(new URL("/books", req.url));
  } else {
    res = NextResponse.next({ request: { headers: req.headers } });
  }
  if (refreshed) setSessionCookies(res, refreshed);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
