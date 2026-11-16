import { readEnvelope } from "./types";

/**
 * Calls the backend through our /api/v1 proxy (cookies carry the auth).
 * A 401 means the session ended (E19, E21): callers show the message, and
 * proxy.ts sends the next navigation to /login.
 */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers =
    init?.body && !(init.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : undefined;
  const res = await fetch(`/api/v1${path}`, { ...init, headers });
  return readEnvelope<T>(res);
}
