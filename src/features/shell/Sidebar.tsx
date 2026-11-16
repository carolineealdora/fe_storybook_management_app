import { Suspense } from "react";
import { cookies } from "next/headers";
import { LogoutButton } from "@/features/auth/LogoutButton";
import { EMAIL_COOKIE } from "@/lib/session";
import { BrandMark } from "./BrandMark";
import { NavLinks, NavList } from "./NavLinks";

async function AdminEmail() {
  const email = (await cookies()).get(EMAIL_COOKIE)?.value;
  return <span className="min-w-0 truncate">{email}</span>;
}

/** Dark sidebar at md+, a top bar on phones. */
export function Sidebar() {
  return (
    <aside className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 bg-nav px-4 py-3 text-nav-text md:sticky md:top-0 md:h-screen md:w-58 md:flex-col md:flex-nowrap md:items-stretch md:gap-1 md:px-3.5 md:py-5">
      <div className="flex items-center gap-2.5 md:px-2 md:pb-5.5">
        <BrandMark />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">MainStory</span>
          <span className="font-mono text-2xs text-nav-faint">
            Book Management
          </span>
        </div>
      </div>
      <nav
        aria-label="Main"
        className="order-last w-full md:order-none md:w-auto"
      >
        <Suspense fallback={<NavList />}>
          <NavLinks />
        </Suspense>
      </nav>
      <div className="ml-auto flex min-w-0 items-center justify-between gap-3 text-small text-nav-faint md:mt-auto md:ml-0 md:border-t md:border-nav-active md:px-2 md:pt-3.5">
        <Suspense fallback={<span />}>
          <AdminEmail />
        </Suspense>
        <LogoutButton />
      </div>
    </aside>
  );
}
