import { clearSession, getSession, saveSession } from "./session";
import { ApiError, SERVICE_UNAVAILABLE_MESSAGE, readEnvelope } from "./types";

/** In dev, Vite proxies /api to the backend (vite.config.ts). Set VITE_API_URL to call it directly. */
export const API_BASE: string = import.meta.env.VITE_API_URL ?? "/api/v1";

let refreshing: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const session = getSession();
  if (!session) return false;
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  }).catch(() => null);
  if (!res?.ok) return false;
  const { data } = (await res.json()) as { data: { access_token: string } };
  saveSession({ ...session, accessToken: data.access_token });
  return true;
}

function send(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getSession()?.accessToken;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (typeof init.body === "string")
    headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${path}`, { ...init, headers }).catch(() => {
    throw new ApiError(0, "SERVICE_UNAVAILABLE", SERVICE_UNAVAILABLE_MESSAGE);
  });
}

let onSessionEnd: () => void = () => undefined;

/** The app registers how to go to /login when the session ends (E19, E21). */
export function setSessionEndHandler(handler: () => void) {
  onSessionEnd = handler;
}

function endSession() {
  clearSession();
  onSessionEnd();
}

/**
 * fetch with the admin's token. On 401 TOKEN_EXPIRED it refreshes once (shared by
 * concurrent requests) and retries (E20); any other 401 ends the session.
 */
export async function authedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const res = await send(path, init);
  if (res.status !== 401 || path.startsWith("/admin/auth/") || !getSession())
    return res;

  const code = (
    (await res
      .clone()
      .json()
      .catch(() => null)) as { error?: { code?: string } } | null
  )?.error?.code;
  if (code === "TOKEN_EXPIRED") {
    refreshing ??= refreshAccessToken().finally(() => (refreshing = null));
    if (await refreshing) return send(path, init);
  }
  endSession();
  return res;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return readEnvelope<T>(await authedFetch(path, init));
}

interface LoginData {
  access_token: string;
  refresh_token: string;
}

export async function login(email: string, password: string) {
  const data = await apiRequest<LoginData>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    email: email.trim().toLowerCase(),
  });
}

/** Revokes the refresh token server-side; signs out locally even if that fails. */
export async function logout() {
  const session = getSession();
  if (session) {
    await apiRequest("/admin/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    }).catch(() => undefined);
  }
  clearSession();
}
