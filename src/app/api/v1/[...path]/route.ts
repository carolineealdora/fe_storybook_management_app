import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  BACKEND_URL,
  REFRESH_COOKIE,
  clearSessionCookies,
  setSessionCookies,
  type TokenPayload,
} from "@/lib/session";

// Backend-for-frontend: forwards admin calls to the Go API with the token from our cookie.
// Only admin endpoints and book covers are reachable through here.
const ALLOWED = /^(admin\/.+|books\/[^/]+\/cover)$/;
const PASS_HEADERS = ["content-type", "cache-control", "x-request-id"];

async function forward(
  req: NextRequest,
  ctx: RouteContext<"/api/v1/[...path]">,
) {
  const path = (await ctx.params).path.join("/");
  if (!ALLOWED.test(path)) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Not found." } },
      { status: 404 },
    );
  }
  const url = `${BACKEND_URL}/api/v1/${path}${req.nextUrl.search}`;
  const token = req.cookies.get(ACCESS_COOKIE)?.value;

  if (path === "admin/auth/logout") {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        refresh_token: req.cookies.get(REFRESH_COOKIE)?.value,
      }),
    }).catch(() => null); // logout locally even if the backend is unreachable
    const res = new NextResponse(null, { status: 204 });
    clearSessionCookies(res);
    return res;
  }

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("authorization", `Bearer ${token}`);
  const body = req.method === "GET" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });

  if (path === "admin/auth/login" && upstream.ok) {
    const { data } = (await upstream.json()) as {
      data: TokenPayload & { account_type: string };
    };
    const { email } = JSON.parse(new TextDecoder().decode(body)) as {
      email: string;
    };
    const res = NextResponse.json({
      data: { account_type: data.account_type },
    });
    setSessionCookies(res, data, email.trim().toLowerCase());
    return res;
  }

  const out = new Headers();
  for (const h of PASS_HEADERS) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}

export { forward as GET, forward as POST, forward as PUT, forward as DELETE };
