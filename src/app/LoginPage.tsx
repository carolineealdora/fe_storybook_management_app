import { Navigate } from "react-router";
import { LoginForm } from "@/features/auth/LoginForm";
import { BrandMark } from "@/features/shell/BrandMark";
import { getSession } from "@/lib/session";

export function LoginPage() {
  if (getSession()) return <Navigate to="/books" replace />;
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <title>Sign in · MainStory Book Management</title>
      <div className="flex w-full max-w-100 flex-col gap-4.5 rounded-lg border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-7" />
          <span className="font-semibold">MainStory · Book Management</span>
        </div>
        <h1 className="text-title font-semibold">Sign in</h1>
        <LoginForm />
        <p className="text-xs text-muted">
          Admin accounts only. Parent accounts are refused.
        </p>
      </div>
    </main>
  );
}
