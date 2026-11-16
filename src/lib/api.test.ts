import { describe, expect, it, vi } from "vitest";
import { apiRequest, setSessionEndHandler } from "./api";
import { getSession, saveSession } from "./session";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });
const expired = () =>
  json(401, { error: { code: "TOKEN_EXPIRED", message: "expired" } });
const authHeader = (init: unknown) =>
  new Headers((init as RequestInit).headers).get("Authorization");

function signedIn() {
  saveSession({
    accessToken: "old",
    refreshToken: "ref",
    email: "admin@mainstory.id",
  });
}

describe("apiRequest", () => {
  it("sends the access token and unwraps data", async () => {
    signedIn();
    const fetchMock = vi.fn().mockResolvedValue(json(200, { data: [1, 2] }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/admin/books")).resolves.toEqual([1, 2]);
    expect(authHeader(fetchMock.mock.calls[0][1])).toBe("Bearer old");
  });

  it("refreshes an expired token once and retries (E20)", async () => {
    signedIn();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(expired())
      .mockResolvedValueOnce(json(200, { data: { access_token: "new" } }))
      .mockResolvedValueOnce(json(200, { data: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/admin/books")).resolves.toBe("ok");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/v1/auth/refresh");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      refresh_token: "ref",
    });
    expect(authHeader(fetchMock.mock.calls[2][1])).toBe("Bearer new");
    expect(getSession()?.accessToken).toBe("new");
  });

  it("shares one refresh between concurrent requests", async () => {
    signedIn();
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.endsWith("/auth/refresh"))
        return Promise.resolve(json(200, { data: { access_token: "new" } }));
      return Promise.resolve(
        authHeader(init) === "Bearer new"
          ? json(200, { data: "ok" })
          : expired(),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      apiRequest("/admin/books"),
      apiRequest("/admin/subscription-plan"),
    ]);
    expect(
      fetchMock.mock.calls.filter(([url]) => url.endsWith("/auth/refresh")),
    ).toHaveLength(1);
  });

  it("ends the session when the refresh token is expired (E21)", async () => {
    signedIn();
    const toLogin = vi.fn();
    setSessionEndHandler(toLogin);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(expired())
        .mockResolvedValueOnce(
          json(401, { error: { code: "REFRESH_TOKEN_EXPIRED", message: "x" } }),
        ),
    );

    await expect(apiRequest("/admin/books")).rejects.toMatchObject({
      code: "TOKEN_EXPIRED",
    });
    expect(getSession()).toBeNull();
    expect(toLogin).toHaveBeenCalledOnce();
  });

  it("reports an unreachable server as SERVICE_UNAVAILABLE", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(apiRequest("/admin/books")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
  });

  it("treats a bare gateway error (proxy, backend down) as SERVICE_UNAVAILABLE", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Bad Gateway", { status: 502 })),
    );
    await expect(apiRequest("/admin/books")).rejects.toMatchObject({
      status: 502,
      code: "SERVICE_UNAVAILABLE",
    });
  });
});
