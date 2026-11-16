import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ACCESS_COOKIE, BACKEND_URL } from "./session";
import { ApiError, readEnvelope } from "./types";

/** GET from the backend inside a Server Component, with the admin's token. */
export async function serverGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) redirect("/login");

  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  try {
    return await readEnvelope<T>(res);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login");
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
