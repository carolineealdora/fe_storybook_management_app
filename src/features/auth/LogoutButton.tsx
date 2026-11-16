"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/client-api";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    await apiRequest("/admin/auth/logout", { method: "POST" }).catch(
      () => undefined,
    );
    router.replace("/login");
    router.refresh(); // drop cached admin pages
  }
  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="rounded-sm text-nav-accent hover:underline focus-visible:outline-2 focus-visible:outline-nav-accent disabled:opacity-60"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
