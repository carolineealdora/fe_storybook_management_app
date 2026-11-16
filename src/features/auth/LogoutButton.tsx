import { useState } from "react";
import { useNavigate } from "react-router";
import { logout } from "@/lib/api";

export function LogoutButton() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  async function onClick() {
    setPending(true);
    await logout();
    navigate("/login", { replace: true });
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="rounded-sm text-nav-accent hover:underline focus-visible:outline-2 focus-visible:outline-nav-accent disabled:opacity-60"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
