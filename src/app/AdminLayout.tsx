import { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { Sidebar } from "@/features/shell/Sidebar";
import { setSessionEndHandler } from "@/lib/api";
import { getSession } from "@/lib/session";

/** Shell for every signed-in page; signed-out visitors go to /login. */
export function AdminLayout() {
  const navigate = useNavigate();
  useEffect(
    () => setSessionEndHandler(() => navigate("/login", { replace: true })),
    [navigate],
  );

  if (!getSession()) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-6 md:px-8 md:py-7">
        <Outlet />
      </main>
    </div>
  );
}
